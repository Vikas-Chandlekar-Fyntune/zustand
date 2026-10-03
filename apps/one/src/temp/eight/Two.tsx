export interface IStudentState {
  search: string;
  department: string;
  page: number;
  sort: "name" | "age";
  food: string[]; // <-- Added multi-select array
}

// features/students/student.store.ts

import { create } from "zustand";
import type { UrlFieldConfig } from "./shared/url-state/types";
import { useUrlStateSync } from "./shared/url-state/use-url-state-sync";
import { useEffect, useRef, useState } from "react";

interface IStudentStore extends IStudentState {
  setSearch: (search: string) => void;
  setDepartment: (department: string) => void;
  setPage: (page: number) => void;
  setSort: (sort: IStudentState["sort"]) => void;
  setFood: (food: string[]) => void; // <-- Added setter

  resetFilters: () => void;
}

const INITIAL_STATE: IStudentState = {
  search: "",
  department: "",
  page: 1,
  sort: "name",
  food: [], // <-- Default empty array
};

const useStudentStore = create<IStudentStore>((set) => ({
  ...INITIAL_STATE,

  setSearch: (search) => {
    set({
      search,
      page: 1,
    });
  },

  setDepartment: (department) => {
    set({
      department,
      page: 1,
    });
  },

  setPage: (page) => {
    set({ page });
  },

  setSort: (sort) => {
    set({
      sort,
      page: 1,
    });
  },

  setFood: (food) => {
    set({
      food,
      page: 1, // Reset to page 1 on filter change
    });
  },

  resetFilters: () => {
    set(INITIAL_STATE);
  },
}));

// features/students/student.url.ts

const STUDENT_URL_CONFIG: UrlFieldConfig<IStudentState>[] = [
  {
    stateKey: "search",
    queryKey: "search",

    parse: (value) => value ?? "",

    serialize: (value) => {
      return value || null;
    },

    defaultValue: "",

    // history: "replace",
    history: "push",
    debounceMs: 500,
  },

  {
    stateKey: "department",
    queryKey: "department",

    parse: (value) => value ?? "",

    serialize: (value) => {
      return value || null;
    },

    defaultValue: "",

    history: "push",
  },

  {
    stateKey: "page",
    queryKey: "page",

    parse: (value) => {
      const page = Number(value);

      if (!Number.isInteger(page) || page < 1) {
        return 1;
      }

      return page;
    },

    serialize: (value) => {
      return value === 1 ? null : String(value);
    },

    defaultValue: 1,

    history: "push",
  },

  {
    stateKey: "sort",
    queryKey: "sort",

    parse: (value) => {
      if (value === "age") {
        return "age";
      }

      return "name";
    },

    serialize: (value) => {
      return value === "name" ? null : value;
    },

    defaultValue: "name",

    history: "push",
  },

  {
    stateKey: "food",
    queryKey: "food", // Parse handling both encoded (%2C) and unencoded (,) commas safely

    parse: (value) => {
      if (!value) return []; // Decode URL entities (%2C -> ,)

      const decodedValue = decodeURIComponent(value);

      return decodedValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }, // Serialize array to comma-separated string

    serialize: (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return null;
      }
      return value.join(",");
    },

    defaultValue: [],
    history: "push",
  },
];

const FOOD_OPTIONS = [
  { id: "pizza fry", label: "Pizza Fry", icon: "🍕" },
  { id: "burger", label: "Burger", icon: "🍔" },
  { id: "sushi", label: "Sushi", icon: "🍣" },
  { id: "tacos", label: "Tacos", icon: "🌮" },
  { id: "ramen", label: "Ramen", icon: "🍜" },
  { id: "pasta", label: "Pasta", icon: "🍝" },
];

function FoodMultiSelect() {
  const selectedFood = useStudentStore((state) => state.food);
  const setFood = useStudentStore((state) => state.setFood);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedFood.includes(value)) {
      setFood(selectedFood.filter((item) => item !== value));
    } else {
      setFood([...selectedFood, value]);
    }
  };

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFood(selectedFood.filter((item) => item !== value));
  };

  const filteredOptions = FOOD_OPTIONS.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full max-w-xs space-y-1.5" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
        Favorite Food
      </label>

      {/* Main Trigger / Badge Input Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[42px] w-full cursor-pointer rounded-lg border bg-white p-1.5 transition-all flex items-center justify-between gap-2 shadow-sm ${
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {selectedFood.length === 0 ? (
            <span className="text-sm text-slate-400 px-1.5">
              Select food...
            </span>
          ) : (
            selectedFood.map((foodId) => {
              const option = FOOD_OPTIONS.find((o) => o.id === foodId);
              return (
                <span
                  key={foodId}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
                >
                  <span>{option?.icon}</span>
                  <span>{option?.label || foodId}</span>
                  <button
                    type="button"
                    onClick={(e) => removeOption(foodId, e)}
                    className="ml-0.5 text-indigo-400 hover:text-indigo-600 rounded p-0.5"
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Chevron Icon */}
        <div className="pr-1 text-slate-400">
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="relative z-10 w-full mt-1 rounded-lg border border-slate-200 bg-white shadow-lg">
          {/* Search Filter Input */}
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          {/* Options List */}
          <ul className="max-h-48 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-xs text-slate-400 text-center">
                No options found
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedFood.includes(option.id);
                return (
                  <li
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>

                    {/* Custom Checkbox */}
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// app/App.tsx

export default function App() {
  // 1. Initialize URL State Synchronization
  useUrlStateSync({
    store: useStudentStore,
    config: STUDENT_URL_CONFIG,
  }); // 2. Zustand State Selectors

  const search = useStudentStore((state) => state.search);
  const department = useStudentStore((state) => state.department);
  const setSearch = useStudentStore((state) => state.setSearch);
  const setDepartment = useStudentStore((state) => state.setDepartment);
  const resetFilters = useStudentStore((state) => state.resetFilters);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Student Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Filters automatically sync with browser URL search parameters
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors px-2.5 py-1.5 rounded-md hover:bg-slate-100"
          >
            Reset Filters
          </button>
        </div>
        {/* Filters Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name..."
              className="w-full h-[42px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
            />
          </div>
          {/* Department Single Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-[42px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          {/* Multi-Select Food Filter */}
          <FoodMultiSelect />
        </div>
      </div>
    </div>
  );
}
