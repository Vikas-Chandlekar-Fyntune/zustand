// shared/url-state/url-state-sync.ts

import type { StoreApi } from "zustand";

import type { HistoryMode, UrlFieldConfig } from "./types";

import { buildUrl, getUrlSearchParams } from "./url-params";

interface IUrlStateSyncOptions<TState> {
  readonly store: StoreApi<TState>;
  readonly config: UrlFieldConfig<TState>[];
}

interface IHistoryUpdate {
  readonly mode: HistoryMode;
  readonly url: string;
}

export class UrlStateSync<TState> {
  private readonly store: StoreApi<TState>;

  private readonly config: UrlFieldConfig<TState>[];

  private readonly timers = new Map<string, number>();

  private isApplyingUrlState = false;

  private unsubscribeStore?: () => void;

  constructor({ store, config }: IUrlStateSyncOptions<TState>) {
    this.store = store;
    this.config = config;
  }

  start(): () => void {
    this.initializeFromUrl();

    this.unsubscribeStore = this.store.subscribe((state, previousState) => {
      this.handleStateChange(state, previousState);
    });

    window.addEventListener("popstate", this.handlePopState);

    return () => {
      this.stop();
    };
  }

  private stop(): void {
    this.unsubscribeStore?.();

    window.removeEventListener("popstate", this.handlePopState);

    this.clearTimers();
  }

  private initializeFromUrl(): void {
    this.applyUrlToStore();
  }

  private readonly handlePopState = (): void => {
    this.applyUrlToStore();
  };

  private applyUrlToStore(): void {
    const urlState = this.getStateFromUrl();

    this.isApplyingUrlState = true;

    try {
      this.store.setState(urlState);
    } finally {
      this.isApplyingUrlState = false;
    }
  }

  private getStateFromUrl(): Partial<TState> {
    const params = getUrlSearchParams();

    const state = {} as Partial<TState>;

    for (const field of this.config) {
      const rawValue = params.get(field.queryKey);

      const value =
        rawValue === null ? field.defaultValue : field.parse(rawValue);

      state[field.stateKey] = value;
    }

    return state;
  }

  private handleStateChange(state: TState, previousState: TState): void {
    if (this.isApplyingUrlState) {
      return;
    }

    for (const field of this.config) {
      const currentValue = state[field.stateKey];
      const previousValue = previousState[field.stateKey];

      if (Object.is(currentValue, previousValue)) {
        continue;
      }

      this.scheduleUrlUpdate(field, currentValue);
    }
  }

  private scheduleUrlUpdate(
    field: UrlFieldConfig<TState>,
    value: TState[keyof TState],
  ): void {
    this.clearTimer(field.queryKey);

    const debounceMs = field.debounceMs ?? 0;

    if (debounceMs === 0) {
      this.updateUrl(field, value);

      return;
    }

    const timer = window.setTimeout(() => {
      this.updateUrl(field, value);

      this.timers.delete(field.queryKey);
    }, debounceMs);

    this.timers.set(field.queryKey, timer);
  }

  private updateUrl(
    field: UrlFieldConfig<TState>,
    value: TState[keyof TState],
  ): void {
    const serializedValue = field.serialize(value);

    const params = getUrlSearchParams();

    if (serializedValue === null) {
      params.delete(field.queryKey);
    } else {
      params.set(field.queryKey, serializedValue);
    }

    const url = buildUrl(params);

    if (url === this.getCurrentUrl()) {
      return;
    }

    const mode = field.history ?? "push";

    this.updateHistory({
      mode,
      url,
    });
  }

  private updateHistory({ mode, url }: IHistoryUpdate): void {
    if (mode === "replace") {
      window.history.replaceState(null, "", url);

      return;
    }

    window.history.pushState(null, "", url);
  }

  private getCurrentUrl(): string {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  private clearTimer(queryKey: string): void {
    const timer = this.timers.get(queryKey);

    if (timer === undefined) {
      return;
    }

    window.clearTimeout(timer);

    this.timers.delete(queryKey);
  }

  private clearTimers(): void {
    for (const timer of this.timers.values()) {
      window.clearTimeout(timer);
    }

    this.timers.clear();
  }
}
