// store/bearStore.ts

import type { StateCreator } from "zustand";
import { composeMiddlewares } from "./store/composer";
import { withDevtools, withImmer, withPersist } from "./store/middlewares1";
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

const useBearStore = composeMiddlewares<IBearStore>(
  createBearSlice,

  withImmer(),
  withPersist({
    name: "bear-storage2",
    storage: createJSONStorage(() => sessionStorage),
    enabled: false,
  }),

  // Clean flag control:
  withDevtools({ name: "BearStore2", enabled: false }),
);

const Three = () => {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <>
      <p>{bears}</p>
      <button onClick={increase}>Increase</button>
    </>
  );
};

export default Three;

/**
 * Compose middleware builtIn as well as 3rd party
 * enabled individual middleware through enabled key in object
 */

// https://share.gemini.google/lZ6KWxaAZpfb