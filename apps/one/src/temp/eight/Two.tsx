export interface IStudentState {
  search: string;
  department: string;
  page: number;
  sort: "name" | "age";
}

// features/students/student.store.ts

import { create } from "zustand";
import type { UrlFieldConfig } from "./shared/url-state/types";
import { useUrlStateSync } from "./shared/url-state/use-url-state-sync";

interface IStudentStore extends IStudentState {
  setSearch: (search: string) => void;
  setDepartment: (department: string) => void;
  setPage: (page: number) => void;
  setSort: (sort: IStudentState["sort"]) => void;

  resetFilters: () => void;
}

const INITIAL_STATE: IStudentState = {
  search: "",
  department: "",
  page: 1,
  sort: "name",
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
];

// app/App.tsx

export default function App() {
  useUrlStateSync({
    store: useStudentStore,
    config: STUDENT_URL_CONFIG,
  });

  const search = useStudentStore((state) => state.search);

  const department = useStudentStore((state) => state.department);

  const setSearch = useStudentStore((state) => state.setSearch);

  const setDepartment = useStudentStore((state) => state.setDepartment);

  return (
    <main>
      <input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        placeholder="Search"
      />

      <select
        value={department}
        onChange={(event) => {
          setDepartment(event.target.value);
        }}
      >
        <option value="">All</option>
        <option value="Engineering">Engineering</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
      </select>
    </main>
  );
}
