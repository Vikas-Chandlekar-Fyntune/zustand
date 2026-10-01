/* eslint-disable @typescript-eslint/no-explicit-any */
// store/middlewares1.ts
import type { StateCreator } from "zustand";
import { devtools, persist, type PersistOptions } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";


type MiddlewareWrapperOptions = {
  enabled?: boolean;
};

// Generic wrapper creator that automatically handles disabling/no-op logic
function createMiddleware<Options>(
  middlewareFn: (
    config: StateCreator<any, [], []>,
    options: Options,
  ) => StateCreator<any, [], []>,
) {
  return <T extends object>(options: Options & MiddlewareWrapperOptions) => {
    return (config: StateCreator<T, [], []>): StateCreator<T, [], []> => {
      // If explicitly disabled, return original slice unchanged
      if (options.enabled === false) {
        return config;
      }
      return middlewareFn(config as any, options);
    };
  };
}

// --- Smart Middleware Definitions ---

export const withDevtools = createMiddleware<{ name: string }>(
  (config, options) => devtools(config as any, { name: options.name }) as any,
);

export const withPersist = createMiddleware<PersistOptions<any>>(
  (config, options) => persist(config as any, options) as any,
);

export const withImmer = <T extends object>(
  options: MiddlewareWrapperOptions = {},
) => {
  return (config: StateCreator<T, [], []>): StateCreator<T, [], []> => {
    if (options.enabled === false) return config;
    return immer(config as any) as any;
  };
};
