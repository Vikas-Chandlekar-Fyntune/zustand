import { create, type StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface IBearState {
  bears: number;
}

interface IBearActions {
  increase(): void;
  increase1(): void;
  removeAll: () => void;
  update(count: number): void;
}

type IBearStore = IBearState & IBearActions;

const INITIAL_BEAR_STATE: IBearState = {
  bears: 0,
};

// Define middleware types on StateCreator to match devtools + persist
const createBearSlice: StateCreator<
  IBearStore,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  IBearStore
> = (set) => ({
  ...INITIAL_BEAR_STATE,

  increase: () =>
    set(
      (state) => ({ bears: state.bears + 1 }),
      false,
      "bears/increase", // Optional action name for Redux DevTools
    ),

  increase1() {
    set(
      (x) => {
        return {
          bears: x.bears + 1,
        };
      },
      false,
      "bears/increase1",
    );
  },

  //   increase1: () =>
  //     set((state) => ({ bears: state.bears + 1 }), false, "bears/increase1"),

  removeAll: () => set({ bears: 0 }, false, "bears/removeAll"),

  update: (count) => set({ bears: count }, false, "bears/update"),
});

const useBearStore = create<IBearStore>()(
  devtools(
    persist(createBearSlice, {
      name: "bear-store",
    }),
    {
      name: "BearStore",
    },
  ),
);

const One = () => {
  const bears = useBearStore((state) => state.bears);
  const increase1 = useBearStore((state) => state.increase1);

  return (
    <>
      <p>{bears}</p>
      <button onClick={increase1}>Increase</button>
    </>
  );
};

export default One;

// Cleaner way to write basic store with middleware (devtools & persist)
