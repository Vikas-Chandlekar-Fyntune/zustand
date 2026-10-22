import { useCallback, useEffect, useRef, useState } from "react";

export interface UseElementRemovalOptions<T extends Element = HTMLElement> {
  enabled?: boolean;
  onRemoved?: (element: T) => void;
  onRestored?: (element: T) => void;
}

export interface UseElementRemovalReturn<T extends Element = HTMLElement> {
  ref: (node: T | null) => void;
  element: T | null;
  isRemoved: boolean;
}

export function useElementRemoval<T extends Element = HTMLElement>({
  enabled = true,
  onRemoved,
  onRestored,
}: UseElementRemovalOptions<T> = {}): UseElementRemovalReturn<T> {
  const [element, setElement] = useState<T | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);

  const elementRef = useRef<T | null>(null);
  const isRemovedRef = useRef(false);

  const callbacksRef = useRef({ onRemoved, onRestored });

  useEffect(() => {
    callbacksRef.current = { onRemoved, onRestored };
  }, [onRemoved, onRestored]);

  const updateStatus = useCallback((removed: boolean, target: T) => {
    if (isRemovedRef.current === removed) return;

    isRemovedRef.current = removed;
    setIsRemoved(removed);

    const callback = removed
      ? callbacksRef.current.onRemoved
      : callbacksRef.current.onRestored;

    callback?.(target);
  }, []);

  const ref = useCallback(
    (node: T | null) => {
      const previousElement = elementRef.current;

      elementRef.current = node;
      setElement(node);

      if (previousElement && !node) {
        updateStatus(true, previousElement);
        return;
      }

      if (node) {
        updateStatus(!node.isConnected, node);
      }
    },
    [updateStatus],
  );

  useEffect(() => {
    if (!enabled || !element) return;

    const ownerDocument = element.ownerDocument;

    if (!ownerDocument) return;

    const checkRemoval = () => {
      const target = elementRef.current;

      if (!target) return;

      updateStatus(!target.isConnected, target);
    };

    const observer = new MutationObserver(checkRemoval);

    const root = element.getRootNode();

    const roots: Node[] = [ownerDocument];

    if (root !== ownerDocument) {
      roots.push(root);
    }

    try {
      for (const observationRoot of roots) {
        if (
          observationRoot.nodeType === Node.DOCUMENT_NODE ||
          observationRoot.nodeType === Node.DOCUMENT_FRAGMENT_NODE
        ) {
          observer.observe(observationRoot, {
            childList: true,
            subtree: true,
          });
        }
      }

      checkRemoval();
    } catch {
      observer.disconnect();
      return;
    }

    return () => {
      observer.disconnect();
    };
  }, [element, enabled, updateStatus]);

  return {
    ref,
    element,
    isRemoved,
  };
}
