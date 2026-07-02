import {
  useState,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { create } from "zustand";

const One = () => {
  const { bears, increase, removeAll, update } = useBear();

  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex flex-col gap-2 ">
        <h1 className="text-center text-xl">
          Bears : <span className="text-red-400">{bears}</span>
        </h1>

        <BearCounter />

        <div className="flex justify-center items-center gap-2">
          <Button className="bg-blue-400" onClick={increase}>
            Increase
          </Button>
          <Button className="bg-blue-400" onClick={() => update(88)}>
            Update
          </Button>
          <Button className="bg-blue-400" onClick={removeAll}>
            Remove
          </Button>
        </div>

        <button onClick={() => setCount((p) => p + 1)}>Count : {count}</button>
      </div>
    </>
  );
};

export default One;

// interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
//   children: ReactNode;
// }

// type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;
type ButtonProps = PropsWithChildren<ComponentProps<"button">>;

export function Button({ children, className = "", ...props }: ButtonProps) {
  console.log("Button");

  return (
    <button className={`p-4 rounded ${className}`} {...props}>
      {children}
    </button>
  );
}

function BearCounter() {
  const bears = useBear((state) => state.bears);
  return <h1 className="text-center">{bears} bears around here...</h1>;
}

interface IBearStore {
  bears: number;
  increase: () => void;
  removeAll: () => void;
  update: (newBears: number) => void;
}

const useBear = create<IBearStore>((set) => ({
  bears: 0,

  increase: () => {
    set((state) => {
      return {
        bears: state.bears + 1,
      };
    });
  },

  removeAll: () =>
    set({
      bears: 0,
    }),

  update: (newBears) =>
    set({
      bears: newBears,
    }),
}));

/**
 * Description: Basic Zustand usage (Beginners Guide)
 */
