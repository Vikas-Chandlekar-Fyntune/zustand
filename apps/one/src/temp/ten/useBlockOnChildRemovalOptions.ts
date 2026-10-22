import { useCallback, useEffect, useRef, useState } from "react";

export interface UseBlockOnChildRemovalOptions {
  enabled?: boolean;
  onChildRemoved?: (child: Node) => void;
  onChildAdded?: (child: Node) => void;
}

export interface UseBlockOnChildRemovalReturn<T extends HTMLElement> {
  ref: (node: T | null) => void;
  isBlocking: boolean;
  element: T | null;
}

export function useBlockOnChildRemoval<T extends HTMLElement = HTMLDivElement>({
  enabled = true,
  onChildRemoved,
  onChildAdded,
}: UseBlockOnChildRemovalOptions = {}): UseBlockOnChildRemovalReturn<T> {
  const [element, setElement] = useState<T | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  const elementRef = useRef<T | null>(null);
  const callbacksRef = useRef({ onChildRemoved, onChildAdded });

  useEffect(() => {
    callbacksRef.current = { onChildRemoved, onChildAdded };
  }, [onChildRemoved, onChildAdded]);

  const ref = useCallback((node: T | null) => {
    elementRef.current = node;
    setElement(node);
  }, []);

  useEffect(() => {
    if (!enabled || !element) {
      return;
    }

    const observer = new MutationObserver((records) => {
      let hasRemovedChild = false;

      for (const record of records) {
        record.removedNodes.forEach((child) => {
          hasRemovedChild = true;
          callbacksRef.current.onChildRemoved?.(child);
        });

        record.addedNodes.forEach((child) => {
          callbacksRef.current.onChildAdded?.(child);
        });
      }

      if (hasRemovedChild) {
        setIsBlocking(true);
      }
    });

    observer.observe(element, {
      childList: true,
    });

    return () => observer.disconnect();
  }, [element, enabled]);

  return {
    ref,
    isBlocking,
    element,
  };
}
