import { useEffect, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

/**
 * Local (instant) value for typing, committed to the store after `delay`.
 * If the store value changes externally (back/forward, reset), local follows.
 */
export function useDebouncedField<T>(
  storeValue: T,
  onCommit: (value: T) => void,
  delay = 500,
) {
  const [local, setLocal] = useState(storeValue);
  const debounced = useDebounce(local, delay);

  const lastSynced = useRef(storeValue);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  // store -> local
  useEffect(() => {
    if (!Object.is(storeValue, lastSynced.current)) {
      lastSynced.current = storeValue;
      setLocal(storeValue);
    }
  }, [storeValue]);

  // local -> store
  useEffect(() => {
    if (Object.is(debounced, lastSynced.current)) return;
    lastSynced.current = debounced;
    onCommitRef.current(debounced);
  }, [debounced]);

  return [local, setLocal] as const;
}
