// shared/url-state/types.ts

export type HistoryMode = "push" | "replace";

export interface IUrlFieldConfig<TState, TKey extends keyof TState> {
  readonly stateKey: TKey;

  readonly queryKey: string;

  readonly parse: (value: string | null) => TState[TKey];

  readonly serialize: (value: TState[TKey]) => string | null;

  readonly defaultValue: TState[TKey];

  readonly history?: HistoryMode;

  readonly debounceMs?: number;
}

export type UrlFieldConfig<TState> = {
  [TKey in keyof TState]: IUrlFieldConfig<TState, TKey>;
}[keyof TState];
