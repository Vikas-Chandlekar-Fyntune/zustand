// shared/url-state/use-url-state-sync.ts

import { useEffect } from "react";

import type { StoreApi } from "zustand";

import type { UrlFieldConfig } from "./types";
import { UrlStateSync } from "./url-state-sync";

interface IUseUrlStateSyncOptions<TState> {
  readonly store: StoreApi<TState>;
  readonly config: UrlFieldConfig<TState>[];
}

export function useUrlStateSync<TState>({
  store,
  config,
}: IUseUrlStateSyncOptions<TState>): void {
  useEffect(() => {
    const sync = new UrlStateSync({
      store,
      config,
    });

    return sync.start();
  }, [store, config]);
}
