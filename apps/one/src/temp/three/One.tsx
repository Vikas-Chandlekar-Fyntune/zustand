import { create } from "zustand";
import { devtools } from "zustand/middleware";

// =======================
// Types
// =======================

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserStore {
  users: Map<number, User>;

  addUser: (user: User) => void;
  updateUser: (id: number, name: string) => void;
  deleteUser: (id: number) => void;
  clearUsers: () => void;
}

// =======================
// Zustand Store
// =======================

const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      users: new Map(),

      addUser: (user) =>
        set(
          (state) => {
            const users = new Map(state.users);

            users.set(user.id, user);

            return { users };
          },
          false,
          "user/addUser",
        ),

      updateUser: (id, name) =>
        set(
          (state) => {
            const users = new Map(state.users);

            const existingUser = users.get(id);

            if (!existingUser) return state;

            users.set(id, {
              ...existingUser,
              name,
            });

            return { users };
          },
          false,
          "user/updateUser",
        ),

      deleteUser: (id) =>
        set(
          (state) => {
            const users = new Map(state.users);

            users.delete(id);

            return { users };
          },
          false,
          "user/deleteUser",
        ),

      clearUsers: () =>
        set(
          () => ({
            users: new Map(),
          }),
          false,
          "user/clearUsers",
        ),
    }),
    {
      name: "user-store",
      serialize: {
        options: {
          // Instructs Redux DevTools to handle JS Set and Map data types
          undefined: true,
          function: false,
          symbol: false,
          map: true,
          set: true,
        },
      },
    },
  ),
);

// =======================
// Component
// =======================

export default function One() {
  const { users, addUser, updateUser, deleteUser, clearUsers } = useUserStore();

  const handleAddUser = () => {
    const id = Date.now();

    addUser({
      id,
      name: `User ${users.size + 1}`,
      email: `user${users.size + 1}@gmail.com`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold">Zustand + Map Example</h1>

        <div className="mb-6 flex gap-3">
          <button
            onClick={handleAddUser}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add User
          </button>

          <button
            onClick={clearUsers}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Clear All
          </button>
        </div>

        <div className="mb-4 rounded bg-gray-100 p-4">
          <p>
            <strong>Total Users:</strong> {users.size}
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3 text-left">ID</th>
              <th className="border p-3 text-left">Name</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {[...users.values()].map((user) => (
              <tr key={user.id}>
                <td className="border p-3">{user.id}</td>

                <td className="border p-3">{user.name}</td>

                <td className="border p-3">{user.email}</td>

                <td className="border p-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        updateUser(user.id, `${user.name} Updated`)
                      }
                      className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => deleteUser(user.id)}
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.size === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="border p-6 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-8 rounded bg-slate-900 p-4 text-green-400">
          <h2 className="mb-3 text-lg font-semibold text-white">Map Content</h2>

          <pre>{JSON.stringify([...users.entries()], null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

/**
 * DESCRIPTION : Map
 */
