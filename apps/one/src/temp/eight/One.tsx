// stores/useEmployeeStore.ts

import { create } from "zustand";

export interface IEmployeeFilters {
  search: string;
  department: string;
}

interface IEmployeeStore extends IEmployeeFilters {
  setSearch: (search: string) => void;
  setDepartment: (department: string) => void;
}

export const useEmployeeStore = create<IEmployeeStore>((set) => ({
  search: "",
  department: "",

  setSearch: (search) => {
    set({ search });
  },

  setDepartment: (department) => {
    set({ department });
  },
}));

// utils/hashParams.ts

export interface IHashFilters {
  search: string;
  department: string;
}

export function getHashFilters(): IHashFilters {
  const hash = window.location.hash.replace(/^#/, "");

  const params = new URLSearchParams(hash);

  return {
    search: params.get("search") ?? "",
    department: params.get("department") ?? "",
  };
}

export function setHashFilters(filters: IHashFilters): void {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.department) {
    params.set("department", filters.department);
  }

  const hash = params.toString();

  window.history.replaceState(
    null,
    "",
    hash ? `#${hash}` : window.location.pathname,
  );
}

// hooks/useHashSync.ts

import { useEffect } from "react";

// import { getHashFilters, setHashFilters } from "../utils/hashParams";

// import { useEmployeeStore } from "../stores/useEmployeeStore";

export function useHashSync(): void {
  const search = useEmployeeStore((state) => state.search);
  const department = useEmployeeStore((state) => state.department);

  const setSearch = useEmployeeStore((state) => state.setSearch);
  const setDepartment = useEmployeeStore((state) => state.setDepartment);

  // URL → Zustand
  useEffect(() => {
    const syncFromHash = () => {
      const filters = getHashFilters();

      setSearch(filters.search);
      setDepartment(filters.department);
    };

    syncFromHash();

    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [setSearch, setDepartment]);

  // Zustand → URL
  useEffect(() => {
    setHashFilters({
      search,
      department,
    });
  }, [search, department]);
}

// App.tsx

// import { useHashSync } from "./hooks/useHashSync";
// import { useEmployeeStore } from "./stores/useEmployeeStore";

export default function One() {
  useHashSync();

  const search = useEmployeeStore((state) => state.search);
  const department = useEmployeeStore((state) => state.department);

  const setSearch = useEmployeeStore((state) => state.setSearch);

  const setDepartment = useEmployeeStore((state) => state.setDepartment);

  return (
    <main>
      <h1>Employee Search</h1>

      <input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        placeholder="Search employee"
      />

      <select
        value={department}
        onChange={(event) => {
          setDepartment(event.target.value);
        }}
      >
        <option value="">All Departments</option>
        <option value="Engineering">Engineering</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
      </select>

      <hr />

      <p>Search: {search || "None"}</p>
      <p>Department: {department || "All"}</p>
    </main>
  );
}

/**
 * Description: 
 *  - This only add in query params.
 */