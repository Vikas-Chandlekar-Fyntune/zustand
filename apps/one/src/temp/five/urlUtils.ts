import type { Department, FilterState } from "./types";

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  department: "All",
  sortBy: "name",
  sortOrder: "asc",
  page: 1,
};

/**
 * Senior Note: Defensive parsing. Users can type anything into the URL.
 * Ensure fallback safety to prevent crashing the UI.
 */
export function getFiltersFromURL(): FilterState {
  if (typeof window === "undefined") return DEFAULT_FILTERS;

  const params = new URLSearchParams(window.location.search);

  const departmentParam = params.get("department");
  const validDepartments: Array<Department | "All"> = [
    "All",
    "Engineering",
    "Design",
    "Marketing",
    "Business",
    "Data Science",
  ];
  const department = validDepartments.includes(departmentParam as any)
    ? (departmentParam as Department | "All")
    : DEFAULT_FILTERS.department;

  const sortByParam = params.get("sortBy");
  const validSortBy: Array<FilterState["sortBy"]> = [
    "name",
    "gpa",
    "enrollmentDate",
  ];
  const sortBy = validSortBy.includes(sortByParam as any)
    ? (sortByParam as FilterState["sortBy"])
    : DEFAULT_FILTERS.sortBy;

  const sortOrderParam = params.get("sortOrder");
  const sortOrder = sortOrderParam === "desc" ? "desc" : "asc";

  const pageParam = parseInt(params.get("page") || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  return {
    search: params.get("search") || "",
    department,
    sortBy,
    sortOrder,
    page,
  };
}

/**
 * Senior Note: Clean URL Management.
 * Avoid cluttering the URL string with defaults like ?page=1&search=&department=All.
 */
export function setURLFromFilters(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.department !== "All")
    params.set("department", filters.department);
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy)
    params.set("sortBy", filters.sortBy);
  if (filters.sortOrder !== DEFAULT_FILTERS.sortOrder)
    params.set("sortOrder", filters.sortOrder);
  if (filters.page > 1) params.set("page", filters.page.toString());

  const queryString = params.toString();
  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;

  // Use replaceState to avoid cluttering browser history stack while typing/filtering
  window.history.replaceState({ ...filters }, "", newUrl);
}
