/* eslint-disable @typescript-eslint/no-explicit-any */
// store/middlewares.ts
import {
  devtools,
  persist,
  subscribeWithSelector,
  type PersistOptions,
} from "zustand/middleware";
import type { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

/**
 * Higher-Order Middleware Modules
 * Simply comment out or remove any function wrapper to detach it.
 */

export const enableDevtools = <T extends object>(name: string) => {
  return (config: StateCreator<T, [], []>) =>
    devtools(config, { name }) as unknown as StateCreator<T, [], []>;
};

export const enablePersist = <T extends object>(options: PersistOptions<T>) => {
  return (config: StateCreator<T, [], []>) =>
    persist(config, options) as unknown as StateCreator<T, [], []>;
};

export const enableImmer = <T extends object>() => {
  return (config: StateCreator<T, [], []>) =>
    immer(config as any) as unknown as StateCreator<T, [], []>;
};

export const enableSubscribeWithSelector = <T extends object>() => {
  return (config: StateCreator<T, [], []>) =>
    subscribeWithSelector(config as any) as unknown as StateCreator<T, [], []>;
};

/**
 * Pass-through / Identity Middleware
 * Use this when you want to disable a middleware conditionally without breaking the pipeline layout.
 */
export const noopMiddleware = <T extends object>() => {
  return (config: StateCreator<T, [], []>) => config;
};
