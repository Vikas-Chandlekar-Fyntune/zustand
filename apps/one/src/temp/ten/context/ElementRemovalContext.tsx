import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from "react";

interface ElementRemovalContextValue {
  ref: RefCallback<HTMLElement>;
  isRemoved: boolean;
}

const ElementRemovalContext = createContext<ElementRemovalContextValue | null>(
  null,
);

interface ElementRemovalProviderProps {
  children: ReactNode;
}

export function ElementRemovalProvider({
  children,
}: ElementRemovalProviderProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);

  const elementRef = useRef<HTMLElement | null>(null);
  const removedRef = useRef(false);

  const updateStatus = useCallback((removed: boolean) => {
    if (removedRef.current === removed) return;

    removedRef.current = removed;
    setIsRemoved(removed);
  }, []);

  const ref = useCallback<RefCallback<HTMLElement>>(
    (node) => {
      elementRef.current = node;
      setElement(node);

      if (node) {
        updateStatus(!node.isConnected);
      }
    },
    [updateStatus],
  );

  useEffect(() => {
    if (!element) return;

    const observer = new MutationObserver(() => {
      const target = elementRef.current;

      if (target) {
        updateStatus(!target.isConnected);
      }
    });

    observer.observe(element.ownerDocument, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [element, updateStatus]);

  return (
    <ElementRemovalContext.Provider value={{ ref, isRemoved }}>
      {children}
    </ElementRemovalContext.Provider>
  );
}

export function useElementRemoval() {
  const context = useContext(ElementRemovalContext);

  if (!context) {
    throw new Error(
      "useElementRemoval must be used within ElementRemovalProvider.",
    );
  }

  return context;
}
