import { create } from "zustand";
import { useState } from "react";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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

  addEmployee: (departmentId: number, employee: Employee) => void;
  updateEmployee: (
    departmentId: number,
    employeeId: number,
    name: string,
    city: string,
  ) => void;
  deleteEmployee: (departmentId: number, employeeId: number) => void;
};

// Persist (Session Storage) + Immer
const useStore = create<Store>()(
  persist(
    immer((set) => ({
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

      // CREATE
      addEmployee: (departmentId, employee) =>
        set((state) => {
          const department = state.departments.find(
            (d) => d.id === departmentId,
          );

          if (!department) return;

          department.employees.push(employee);
        }),

      // UPDATE
      updateEmployee: (departmentId, employeeId, name, city) =>
        set((state) => {
          const department = state.departments.find(
            (d) => d.id === departmentId,
          );

          if (!department) return;

          const employee = department.employees.find(
            (e) => e.id === employeeId,
          );

          if (!employee) return;

          employee.name = name;
          employee.city = city;
        }),

      // DELETE
      deleteEmployee: (departmentId, employeeId) =>
        set((state) => {
          const department = state.departments.find(
            (d) => d.id === departmentId,
          );

          if (!department) return;

          department.employees = department.employees.filter(
            (employee) => employee.id !== employeeId,
          );
        }),
    })),
    {
      name: "employee-store-immer",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default function Three() {
  const department = useStore((state) => state.departments[0]);

  const addEmployee = useStore((state) => state.addEmployee);
  const updateEmployee = useStore((state) => state.updateEmployee);
  const deleteEmployee = useStore((state) => state.deleteEmployee);

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

      <div className="space-y-4">
        {department.employees.map((employee) => (
          <EmployeeRow
            key={employee.id}
            employee={employee}
            updateEmployee={updateEmployee}
            deleteEmployee={deleteEmployee}
          />
        ))}
      </div>
    </div>
  );
}

type EmployeeRowProps = {
  employee: Employee;
  updateEmployee: Store["updateEmployee"];
  deleteEmployee: Store["deleteEmployee"];
};

function EmployeeRow({
  employee,
  updateEmployee,
  deleteEmployee,
}: EmployeeRowProps) {
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

/**
 * Description: CRUD
 * Persist middleware (Session Storage) + Immer
 */