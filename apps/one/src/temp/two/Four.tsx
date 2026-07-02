import { create } from "zustand";
import { useState } from "react";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

/* ========================================================================== */
/*                                   TYPES                                    */
/* ========================================================================== */

type Employee = {
  id: number;
  name: string;
  city: string;
};

type Department = {
  id: number;
  name: string;
  employees: Employee[];
};

type Store = {
  departments: Department[];
};

/* ========================================================================== */
/*                                   STORE                                    */
/* ========================================================================== */

const useStore = create<Store>()(
  persist(
    immer(() => ({
      departments: [
        {
          id: 1,
          name: "Engineering",
          employees: [
            {
              id: 1,
              name: "Vikas",
              city: "Mumbai",
            },
          ],
        },
      ],
    })),
    {
      name: "employee-store-immer-code-split",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

/* ========================================================================== */
/*                                  ACTIONS                                   */
/* ========================================================================== */

// CREATE
const addEmployee = (departmentId: number, employee: Employee) => {
  useStore.setState((state) => {
    const department = state.departments.find((d) => d.id === departmentId);

    if (!department) return;

    department.employees.push(employee);
  });
};

// UPDATE
const updateEmployee = (
  departmentId: number,
  employeeId: number,
  name: string,
  city: string,
) => {
  useStore.setState((state) => {
    const department = state.departments.find((d) => d.id === departmentId);

    if (!department) return;

    const employee = department.employees.find((e) => e.id === employeeId);

    if (!employee) return;

    employee.name = name;
    employee.city = city;
  });
};

// DELETE
const deleteEmployee = (departmentId: number, employeeId: number) => {
  useStore.setState((state) => {
    const department = state.departments.find((d) => d.id === departmentId);

    if (!department) return;

    department.employees = department.employees.filter(
      (employee) => employee.id !== employeeId,
    );
  });
};

/* ========================================================================== */
/*                                MAIN COMPONENT                              */
/* ========================================================================== */

export default function Four() {
  const department = useStore((state) => state.departments[0]);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const handleAdd = () => {
    if (!name || !city) return;

    addEmployee(1, {
      id: Date.now(),
      name,
      city,
    });

    setName("");
    setCity("");
  };

  return (
    <div className="mx-auto mt-10 max-w-xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Employee CRUD</h1>

      {/* Add Employee */}

      <div className="mb-6 flex gap-2">
        <input
          className="flex-1 rounded border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="flex-1 rounded border p-2"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button
          onClick={handleAdd}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Add
        </button>
      </div>

      {/* Employee List */}

      <div className="space-y-4">
        {department.employees.map((employee) => (
          <EmployeeRow key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                              EMPLOYEE ROW                                  */
/* ========================================================================== */

type EmployeeRowProps = {
  employee: Employee;
};

function EmployeeRow({ employee }: EmployeeRowProps) {
  const [editName, setEditName] = useState(employee.name);
  const [editCity, setEditCity] = useState(employee.city);

  return (
    <div className="rounded border p-4">
      <div className="mb-3 flex gap-2">
        <input
          className="flex-1 rounded border p-2"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />

        <input
          className="flex-1 rounded border p-2"
          value={editCity}
          onChange={(e) => setEditCity(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          className="rounded bg-green-600 px-3 py-1 text-white"
          onClick={() => updateEmployee(1, employee.id, editName, editCity)}
        >
          Update
        </button>

        <button
          className="rounded bg-red-600 px-3 py-1 text-white"
          onClick={() => deleteEmployee(1, employee.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                                DESCRIPTION                                 */
/* ========================================================================== */

/*
Pattern Used:
--------------
✅ State only inside Zustand Store
✅ Actions are standalone functions
✅ Components subscribe only to state
✅ Persist Middleware (Session Storage)
✅ Immer Middleware

Benefits:
---------
✔ No need to subscribe to actions.
✔ Actions can be called from anywhere.
✔ Easier code splitting.
✔ Easier testing.
✔ Cleaner separation of state and business logic.
*/

/**
 * References: 
 * - https://zustand.docs.pmnd.rs/learn/guides/practice-with-no-store-actions
 */