// store/bearSlice.ts
import type { StateCreator } from "zustand";
import { composeMiddlewares } from "./store/composer";
import {
  enableDevtools,
  enablePersist,
  noopMiddleware,
} from "./store/middlewares";
import { createJSONStorage } from "zustand/middleware";

export interface IBearState {
  bears: number;
}

export interface IBearActions {
  increase: () => void;
  removeAll: () => void;
  update: (count: number) => void;
}

export type IBearStore = IBearState & IBearActions;

const INITIAL_BEAR_STATE: IBearState = {
  bears: 0,
};

const createBearSlice: StateCreator<IBearStore, [], []> = (set) => ({
  ...INITIAL_BEAR_STATE,

  increase: () => set((state) => ({ bears: state.bears + 1 })),
  removeAll: () => set({ bears: 0 }),
  update: (count) => set({ bears: count }),
});

// const IS_PROD = Math.random() > 0.5;
const IS_PROD = true;
// const IS_PROD = false;

const useBearStore = composeMiddlewares<IBearStore>(
  createBearSlice,

  // --- ATTACH / DETACH MIDDLEWARES HERE ---
  enablePersist({
    name: "bear-storage1",
    storage: createJSONStorage(() => sessionStorage),
  }),

  // Conditionally disable or completely remove lines:
  IS_PROD ? noopMiddleware() : enableDevtools("BearStore1"),
);

const Two = () => {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <>
      <p>{bears}</p>
      <button onClick={increase}>Increase</button>
    </>
  );
};

export default Two;
/**
 * Compose middleware builtIn as well as 3rd party
 * enabled individual middleware through ternary operator
 */

// https://share.gemini.google/lZ6KWxaAZpfb