import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

// NOTE: Enabling Map and Set plugins for Immer
enableMapSet();

interface User {
  id: number;
  name: string;
}

interface SelectedStore {
  selectedIds: Set<number>;

  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  clear: () => void;
}

const useSelectedStore = create<SelectedStore>()(
  devtools(
    persist(
      immer((set) => ({
        selectedIds: new Set<number>(),

        add: (id) =>
          set(
            (state) => {
              // Immer allows direct mutation syntax
              state.selectedIds.add(id);
            },
            false,
            "selected/add",
          ),

        remove: (id) =>
          set(
            (state) => {
              state.selectedIds.delete(id);
            },
            false,
            "selected/remove",
          ),

        toggle: (id) =>
          set(
            (state) => {
              if (state.selectedIds.has(id)) {
                state.selectedIds.delete(id);
              } else {
                state.selectedIds.add(id);
              }
            },
            false,
            "selected/toggle",
          ),

        clear: () =>
          set(
            (state) => {
              state.selectedIds.clear();
            },
            false,
            "selected/clear",
          ),
      })),
      {
        name: "selected-store-storage", // Key used in storage
        storage: createJSONStorage(() => sessionStorage, {
          // Serialize Set to Array when saving to storage
          replacer: (key, value) => {
            if (value instanceof Set) {
              return { __type: "Set", value: Array.from(value) };
            }
            return value;
          },
          // Deserialize Array back to Set when loading from storage
          reviver: (key, value) => {
            if (value && typeof value === "object" && value.__type === "Set") {
              return new Set(value.value);
            }
            return value;
          },
        }),
      },
    ),
    {
      name: "selected-store", // Name shown in Redux DevTools
      serialize: {
        options: {
          set: true, // Enables Set inspection in Redux DevTools
        },
      },
    },
  ),
);

const users: User[] = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Alice Smith" },
  { id: 3, name: "Bob Johnson" },
  { id: 4, name: "Emma Wilson" },
  { id: 5, name: "David Brown" },
];

export default function Three() {
  const { selectedIds, add, remove, toggle, clear } = useSelectedStore();

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center">
          Zustand Set Example
        </h1>

        <div className="space-y-4">
          {users.map((user) => {
            const isSelected = selectedIds.has(user.id);

            return (
              <div
                key={user.id}
                className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>

                  <p
                    className={`font-medium ${
                      isSelected ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isSelected ? "✅ Selected" : "❌ Not Selected"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => add(user.id)}
                    className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                  >
                    Add
                  </button>

                  <button
                    onClick={() => remove(user.id)}
                    className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                  >
                    Remove
                  </button>

                  <button
                    onClick={() => toggle(user.id)}
                    className="rounded bg-amber-500 px-4 py-2 text-white transition hover:bg-amber-600"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 border-t pt-6">
          <button
            onClick={clear}
            className="rounded bg-gray-800 px-5 py-2 text-white transition hover:bg-black"
          >
            Clear All
          </button>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-2 text-xl font-semibold">Selected IDs</h2>

              <pre className="overflow-auto rounded bg-slate-900 p-4 text-green-400">
                {JSON.stringify([...selectedIds], null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">Selected Count</h2>

              <div className="rounded bg-blue-100 p-4 text-4xl font-bold text-blue-700">
                {selectedIds.size}
              </div>

              <h2 className="mt-6 mb-2 text-xl font-semibold">Iterate Set</h2>

              <ul className="space-y-2">
                {[...selectedIds].map((id) => (
                  <li key={id} className="rounded bg-green-100 p-2">
                    User ID: {id}
                  </li>
                ))}

                {selectedIds.size === 0 && (
                  <li className="text-gray-500">No users selected.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** DESCRIPTION : Set
 *   - devtools + persist (Session Storage) + immer
 */
