import { useEffect } from "react";

import { create } from "zustand";
import { useShallow } from "zustand/shallow";

interface Store {
  count: number;
  user: string;
  increase: () => void;
  changeUser: () => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  user: "John",

  increase: () =>
    set((state) => ({
      count: state.count + 1,
    })),

  changeUser: () =>
    set((state) => ({
      user: state.user === "John" ? "Alice" : "John",
    })),
}));

function Counter(): React.JSX.Element {
  // PROBLEM : Maximum update depth exceeded
  //   const { count, user } = useStore((state) => ({
  //     count: state.count,
  //     user: state.user,
  //   }));

  // SOLUTION 1
  //   const { count, user } = useStore(
  //     useShallow((state) => ({
  //       count: state.count,
  //       user: state.user,
  //     })),
  //   );

  // SOLUTION 2
  //   const count = useStore((state) => state.count);
  //   const user = useStore((state) => state.user);

  // SOLUTION 3
  const [count, user] = useStore(
    useShallow((state) => [state.count, state.user]),
  );

  console.log("Counter Render");

  return (
    <div className="rounded border p-5">
      <h2 className="text-xl font-bold">{count}</h2>

      <p>{user}</p>
    </div>
  );
}

function Buttons(): React.JSX.Element {
  const increase = useStore((state) => state.increase);
  const changeUser = useStore((state) => state.changeUser);

  return (
    <div className="space-x-3">
      <button
        onClick={increase}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Increase
      </button>

      <button
        onClick={changeUser}
        className="rounded bg-green-500 px-4 py-2 text-white"
      >
        Change User
      </button>
    </div>
  );
}

export default function One(): React.JSX.Element {
  useEffect(() => {
    console.clear();
  }, []);

  return (
    <div className="space-y-5 p-10">
      <Counter />
      <Buttons />
    </div>
  );
}

// DESCRIPTION : useShallow
// LINK : https://chatgpt.com/share/6a4b87eb-36d4-83e8-b16e-b7ddd97c2389