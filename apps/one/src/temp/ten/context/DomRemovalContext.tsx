import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface DomRemovalOptions {
  selectors: string[];
  enabled?: boolean;
}

interface DomRemovalResult {
  isPresent: boolean;
  isRemoved: boolean;
}

interface Subscriber {
  selectors: string[];
  foundElements: Set<Element>;
  onStatusChange: (status: DomRemovalResult) => void;
  isPresent: boolean;
  isRemoved: boolean;
}

interface DomRemovalContextValue {
  subscribe: (id: string, subscriber: Subscriber) => () => void;
}

const DomRemovalContext = createContext<DomRemovalContextValue | null>(null);

interface DomRemovalProviderProps {
  children: ReactNode;
}

export function DomRemovalProvider({ children }: DomRemovalProviderProps) {
  const subscribersRef = useRef(new Map<string, Subscriber>());

  const scan = useCallback(() => {
    for (const subscriber of subscribersRef.current.values()) {
      let foundNow = false;

      for (const selector of subscriber.selectors) {
        let matches: Element[];

        try {
          matches = Array.from(document.querySelectorAll(selector));
        } catch {
          // Ignore invalid CSS selectors.
          continue;
        }

        if (matches.length > 0) {
          foundNow = true;

          for (const element of matches) {
            subscriber.foundElements.add(element);
          }
        }
      }

      const wasPresent = subscriber.isPresent;
      const wasRemoved = subscriber.isRemoved;

      if (foundNow) {
        subscriber.isPresent = true;
        subscriber.isRemoved = false;
      } else if (subscriber.foundElements.size > 0) {
        subscriber.isPresent = false;
        subscriber.isRemoved = true;
      }

      if (
        wasPresent !== subscriber.isPresent ||
        wasRemoved !== subscriber.isRemoved
      ) {
        subscriber.onStatusChange({
          isPresent: subscriber.isPresent,
          isRemoved: subscriber.isRemoved,
        });
      }
    }
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(scan);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    scan();

    return () => observer.disconnect();
  }, [scan]);

  const subscribe = useCallback(
    (id: string, subscriber: Subscriber) => {
      subscribersRef.current.set(id, subscriber);

      // Detect an element that already exists.
      scan();

      return () => {
        subscribersRef.current.delete(id);
      };
    },
    [scan],
  );

  const value = useMemo(() => ({ subscribe }), [subscribe]);

  return (
    <DomRemovalContext.Provider value={value}>
      {children}
    </DomRemovalContext.Provider>
  );
}

export function useDomRemoval({
  selectors,
  enabled = true,
}: DomRemovalOptions): DomRemovalResult {
  const context = useContext(DomRemovalContext);

  if (!context) {
    throw new Error("useDomRemoval must be used within DomRemovalProvider.");
  }

  const id = useId();

  const [status, setStatus] = useState<DomRemovalResult>({
    isPresent: false,
    isRemoved: false,
  });

  const selectorKey = JSON.stringify(selectors);

  useEffect(() => {
    if (!enabled || selectors.length === 0) {
      setStatus({
        isPresent: false,
        isRemoved: false,
      });

      return;
    }

    const subscriber: Subscriber = {
      selectors: JSON.parse(selectorKey) as string[],
      foundElements: new Set(),
      isPresent: false,
      isRemoved: false,
      onStatusChange: setStatus,
    };

    return context.subscribe(id, subscriber);
  }, [context, enabled, id, selectorKey]);

  return status;
}
