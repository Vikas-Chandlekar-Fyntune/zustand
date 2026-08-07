import { create } from "zustand";
import {
  DEFAULT_FILTERS,
  getFiltersFromURL,
  setURLFromFilters,
} from "./urlUtils";
import type { FilterState } from "./types";

interface StudentStore {
  filters: FilterState;
  setFilters: (
    updater:
      | Partial<FilterState>
      | ((prev: FilterState) => Partial<FilterState>),
  ) => void;
  resetFilters: () => void;
  syncFromURL: () => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  // Initialize state cleanly directly out of the URL matrix (Handles Refresh Restore)
  filters: getFiltersFromURL(),

  setFilters: (updater) =>
    set((state) => {
      const nextChanges =
        typeof updater === "function" ? updater(state.filters) : updater;
      const updatedFilters = { ...state.filters, ...nextChanges };

      // Edge Case: If filter parameters change (except page), automatically snap back to page 1
      if (!("page" in nextChanges) && nextChanges.page === undefined) {
        updatedFilters.page = 1;
      }

      setURLFromFilters(updatedFilters);
      return { filters: updatedFilters };
    }),

  resetFilters: () => {
    setURLFromFilters(DEFAULT_FILTERS);
    set({ filters: DEFAULT_FILTERS });
  },

  syncFromURL: () => {
    set({ filters: getFiltersFromURL() });
  },
}));
