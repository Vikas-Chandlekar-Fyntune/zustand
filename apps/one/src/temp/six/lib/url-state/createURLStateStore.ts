import { useEffect } from "react";
import { create } from "zustand";
import { buildURL, getDefaults, parseState, writeState, type Schema } from "./core";
import { browserHistoryAdapter, type HistoryAdapter } from "./historyAdapter";

export type HistoryMode = "push" | "replace";

export interface URLStateStore<T> {
  state: T;
  set: (
    updater: Partial<T> | ((prev: T) => Partial<T>),
    mode?: HistoryMode,
  ) => void;
  reset: (mode?: HistoryMode) => void;
  /** Re-read state from the current URL (used for back/forward). Never writes history. */
  syncFromURL: () => void;
}

export interface URLStateStoreOptions<T extends object> {
  schema: Schema<T>;
  history?: HistoryAdapter;
  defaultMode?: HistoryMode;
  /**
   * Domain rules applied after a change, e.g. "reset page when filters change".
   * Keeps business logic out of the generic store.
   */
  normalize?: (next: T, changes: Partial<T>, prev: T) => T;
}

export function createURLStateStore<T extends object>({
  schema,
  history = browserHistoryAdapter,
  defaultMode = "push",
  normalize,
}: URLStateStoreOptions<T>) {
  const readFromURL = () => parseState<T>(schema, history.getLocation().search);

  const writeToURL = (next: T, mode: HistoryMode) => {
    const { pathname, search, hash } = history.getLocation();
    const params = writeState(schema, next, search);
    const currentQs = new URLSearchParams(search).toString();

    if (params.toString() === currentQs) return; // avoid duplicate history entries

    const url = buildURL(pathname, params, hash);
    if (mode === "push") history.push(url, next);
    else history.replace(url, next);
  };

  const useStore = create<URLStateStore<T>>((set, get) => ({
    state: readFromURL(),

    set: (updater, mode = defaultMode) => {
      const prev = get().state;
      const changes = typeof updater === "function" ? updater(prev) : updater;
      let next = { ...prev, ...changes } as T;
      if (normalize) next = normalize(next, changes, prev);

      writeToURL(next, mode);
      set({ state: next });
    },

    reset: (mode = defaultMode) => {
      const next = getDefaults(schema);
      writeToURL(next, mode);
      set({ state: next });
    },

    syncFromURL: () => set({ state: readFromURL() }),
  }));

  /** Call once near the root of the page that uses the store. */
  function useSyncWithHistory() {
    useEffect(
      () => history.subscribe(() => useStore.getState().syncFromURL()),
      [],
    );
  }

  return { useStore, useSyncWithHistory };
}
