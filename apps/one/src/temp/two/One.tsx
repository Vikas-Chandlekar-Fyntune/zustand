import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Employee = {
  id: number;
  name: string;
  address: {
    city: string;
    country: string;
  };
};

type Department = {
  id: number;
  name: string;
  employees: Employee[];
};

type Store = {
  departments: Department[];

  updateEmployeeCity: (
    departmentId: number,
    employeeId: number,
    city: string,
  ) => void;

  reset: () => void;
};

const initialState = {
  departments: [
    {
      id: 1,
      name: "Engineering",
      employees: [
        {
          id: 101,
          name: "Vikas",
          address: {
            city: "Mumbai",
            country: "India",
          },
        },
      ],
    },
  ],
} satisfies Pick<Store, "departments">;

// Normal Zustand store without Immer
const useStore = create<Store>((set) => ({
  ...initialState,

  updateEmployeeCity: (departmentId, employeeId, city) =>
    set((state) => ({
      departments: state.departments.map((department) => {
        if (department.id !== departmentId) {
          return department;
        }

        return {
          ...department,
          employees: department.employees.map((employee) => {
            if (employee.id !== employeeId) {
              return employee;
            }

            return {
              ...employee,
              address: {
                ...employee.address,
                city,
              },
            };
          }),
        };
      }),
    })),

  reset: () => set(initialState),
}));

// Zustand store with Immer
const useStoreImmer = create<Store>()(
  immer((set) => ({
    ...initialState,

    updateEmployeeCity: (departmentId, employeeId, city) =>
      set((state) => {
        const department = state.departments.find((d) => d.id === departmentId);

        if (!department) return;

        const employee = department.employees.find((e) => e.id === employeeId);

        if (!employee) return;

        employee.address.city = city;
      }),

    reset: () => set(initialState),
  })),
);

export default function App() {
  const employee = useStore((state) => state.departments[0].employees[0]);

  const updateEmployeeCity = useStore((state) => state.updateEmployeeCity);

  const employeeImmer = useStoreImmer(
    (state) => state.departments[0].employees[0],
  );

  const updateEmployeeCityImmer = useStoreImmer(
    (state) => state.updateEmployeeCity,
  );

  return (
    <div className="p-4">
      <h2>{employee.name}</h2>
      <p>{employee.address.city}</p>

      <button
        className="rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => updateEmployeeCity(1, 101, "Pune")}
      >
        Change City
      </button>

      <h2>{employeeImmer.name}</h2>
      <p>{employeeImmer.address.city}</p>

      <button
        className="rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => updateEmployeeCityImmer(1, 101, "Pune")}
      >
        Change City
      </button>
    </div>
  );
}

/**
 * Description: Nested Object
 * With / Without Immer Store
 */
