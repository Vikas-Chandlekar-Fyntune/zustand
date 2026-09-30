import { useEffect, useState, useMemo, useRef } from "react";
import { create } from "zustand";

function isOneOf<T extends readonly string[]>(
  value: string | null,
  values: T,
): value is T[number] {
  return value !== null && values.includes(value as T[number]);
}

// ==========================================
// 1. TYPES & DATA DEFINITIONS
// ==========================================
type Department =
  | "Engineering"
  | "Design"
  | "Marketing"
  | "Business"
  | "Data Science";

interface Student {
  id: string;
  name: string;
  email: string;
  department: Department;
  gpa: number;
  enrollmentDate: string;
}

interface PaginationState<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface FilterState {
  search: string;
  department: Department | "All";
  sortBy: "name" | "gpa" | "enrollmentDate";
  sortOrder: "asc" | "desc";
  page: number;
}

const HistoryAction = {
  PUSH: "push",
  REPLACE: "replace",
} as const;

type THistoryAction = (typeof HistoryAction)[keyof typeof HistoryAction];

const ITEMS_PER_PAGE = 5;

const DUMMY_STUDENTS: Student[] = [
  {
    id: "1",
    name: "Alice Smith",
    email: "alice@univ.edu",
    department: "Engineering",
    gpa: 3.8,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "2",
    name: "Bob Jones",
    email: "bob@univ.edu",
    department: "Design",
    gpa: 3.4,
    enrollmentDate: "2023-09-02",
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@univ.edu",
    department: "Marketing",
    gpa: 3.9,
    enrollmentDate: "2022-01-15",
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@univ.edu",
    department: "Business",
    gpa: 3.2,
    enrollmentDate: "2024-02-10",
  },
  {
    id: "5",
    name: "Evan Wright",
    email: "evan@univ.edu",
    department: "Data Science",
    gpa: 3.7,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "6",
    name: "Fiona Gallagher",
    email: "fiona@univ.edu",
    department: "Engineering",
    gpa: 2.9,
    enrollmentDate: "2023-05-12",
  },
  {
    id: "7",
    name: "George Clark",
    email: "george@univ.edu",
    department: "Design",
    gpa: 3.5,
    enrollmentDate: "2022-09-01",
  },
  {
    id: "8",
    name: "Hannah Abbott",
    email: "hannah@univ.edu",
    department: "Marketing",
    gpa: 3.6,
    enrollmentDate: "2024-01-20",
  },
  {
    id: "9",
    name: "Ian Malcolm",
    email: "ian@univ.edu",
    department: "Data Science",
    gpa: 4.0,
    enrollmentDate: "2021-09-01",
  },
  {
    id: "10",
    name: "Julia Roberts",
    email: "julia@univ.edu",
    department: "Business",
    gpa: 3.1,
    enrollmentDate: "2023-11-05",
  },
  {
    id: "11",
    name: "Kevin Mitnick",
    email: "kevin@univ.edu",
    department: "Engineering",
    gpa: 3.85,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "12",
    name: "Laura Croft",
    email: "laura@univ.edu",
    department: "Design",
    gpa: 3.45,
    enrollmentDate: "2022-03-14",
  },
  {
    id: "13",
    name: "Michael Scott",
    email: "michael@univ.edu",
    department: "Business",
    gpa: 2.5,
    enrollmentDate: "2021-08-25",
  },
  {
    id: "14",
    name: "Natalie Portman",
    email: "natalie@univ.edu",
    department: "Marketing",
    gpa: 3.95,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "15",
    name: "Oliver Twist",
    email: "oliver@univ.edu",
    department: "Engineering",
    gpa: 3.0,
    enrollmentDate: "2024-05-01",
  },
  {
    id: "16",
    name: "Penelope Cruz",
    email: "penelope@univ.edu",
    department: "Data Science",
    gpa: 3.72,
    enrollmentDate: "2023-02-28",
  },
  {
    id: "17",
    name: "Quinn Harley",
    email: "quinn@univ.edu",
    department: "Design",
    gpa: 3.3,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "18",
    name: "Ryan Reynolds",
    email: "ryan@univ.edu",
    department: "Business",
    gpa: 3.65,
    enrollmentDate: "2022-09-10",
  },
  {
    id: "19",
    name: "Sarah Connor",
    email: "sarah@univ.edu",
    department: "Engineering",
    gpa: 3.88,
    enrollmentDate: "2022-01-05",
  },
  {
    id: "20",
    name: "Tony Stark",
    email: "tony@univ.edu",
    department: "Engineering",
    gpa: 4.0,
    enrollmentDate: "2021-09-01",
  },
  {
    id: "21",
    name: "Ursula Buffay",
    email: "ursula@univ.edu",
    department: "Marketing",
    gpa: 2.8,
    enrollmentDate: "2023-09-15",
  },
  {
    id: "22",
    name: "Victor Von",
    email: "victor@univ.edu",
    department: "Data Science",
    gpa: 3.91,
    enrollmentDate: "2023-08-11",
  },
  {
    id: "23",
    name: "Wendy Darling",
    email: "wendy@univ.edu",
    department: "Design",
    gpa: 3.42,
    enrollmentDate: "2024-01-10",
  },
  {
    id: "24",
    name: "Xavier Charles",
    email: "xavier@univ.edu",
    department: "Engineering",
    gpa: 3.97,
    enrollmentDate: "2021-09-01",
  },
  {
    id: "25",
    name: "Yolanda Hadid",
    email: "yolanda@univ.edu",
    department: "Business",
    gpa: 3.15,
    enrollmentDate: "2023-06-20",
  },
  {
    id: "26",
    name: "Zack Morris",
    email: "zack@univ.edu",
    department: "Marketing",
    gpa: 3.35,
    enrollmentDate: "2022-09-01",
  },
  {
    id: "27",
    name: "Arthur Dent",
    email: "arthur@univ.edu",
    department: "Engineering",
    gpa: 3.05,
    enrollmentDate: "2023-10-01",
  },
  {
    id: "28",
    name: "Bruce Wayne",
    email: "bruce@univ.edu",
    department: "Business",
    gpa: 3.99,
    enrollmentDate: "2021-05-20",
  },
  {
    id: "29",
    name: "Clark Kent",
    email: "clark@univ.edu",
    department: "Marketing",
    gpa: 3.75,
    enrollmentDate: "2022-04-12",
  },
  {
    id: "30",
    name: "Diana Ross",
    email: "diana.r@univ.edu",
    department: "Design",
    gpa: 3.6,
    enrollmentDate: "2023-07-07",
  },
];

const DEFAULT_FILTERS: FilterState = {
  search: "",
  department: "All",
  sortBy: "name",
  sortOrder: "asc",
  page: 1,
};

// ==========================================
// 2. STATE RECOVERY & URL CLEANING UTILS
// ==========================================
function getFiltersFromURL(): FilterState {
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

  const department = isOneOf(departmentParam, validDepartments)
    ? (departmentParam as Department | "All")
    : DEFAULT_FILTERS.department;

  const sortByParam = params.get("sortBy");
  const validSortBy: Array<FilterState["sortBy"]> = [
    "name",
    "gpa",
    "enrollmentDate",
  ];
  const sortBy = isOneOf(sortByParam, validSortBy)
    ? (sortByParam as FilterState["sortBy"])
    : DEFAULT_FILTERS.sortBy;

  const pageParam = parseInt(params.get("page") || "1", 10);

  return {
    search: params.get("search") || "",
    department,
    sortBy,
    sortOrder: params.get("sortOrder") === "desc" ? "desc" : "asc",
    page: isNaN(pageParam) || pageParam < 1 ? 1 : pageParam,
  };
}

// function setURLFromFilters(
//   filters: FilterState,
//   actionType: THistoryAction = HistoryAction.PUSH,
// ) {
//   const params = new URLSearchParams();

//   // Clean URL preservation optimization: Omits defaults
//   if (filters.search) params.set("search", filters.search);
//   if (filters.department !== "All")
//     params.set("department", filters.department);
//   if (filters.sortBy !== DEFAULT_FILTERS.sortBy)
//     params.set("sortBy", filters.sortBy);
//   if (filters.sortOrder !== DEFAULT_FILTERS.sortOrder)
//     params.set("sortOrder", filters.sortOrder);
//   if (filters.page > 1) params.set("page", filters.page.toString());

//   const queryString = params.toString();
//   const newUrl = queryString
//     ? `${window.location.pathname}?${queryString}`
//     : window.location.pathname;

//   // Guard clause against pushing duplicate entries to history array
//   if (
//     window.location.search === `?${queryString}` ||
//     (window.location.search === "" && !queryString)
//   ) {
//     return;
//   }

//   if (actionType === HistoryAction.PUSH) {
//     window.history.pushState({ ...filters }, "", newUrl);
//   } else {
//     window.history.replaceState({ ...filters }, "", newUrl);
//   }
// }

function setURLFromFilters(
  filters: FilterState,
  actionType: THistoryAction = HistoryAction.PUSH,
) {
  const params = new URLSearchParams(window.location.search);

  updateURLParam(params, "search", filters.search);
  updateURLParam(
    params,
    "department",
    filters.department === "All" ? "" : filters.department,
  );
  updateURLParam(
    params,
    "sortBy",
    filters.sortBy === DEFAULT_FILTERS.sortBy ? "" : filters.sortBy,
  );
  updateURLParam(
    params,
    "sortOrder",
    filters.sortOrder === DEFAULT_FILTERS.sortOrder
      ? ""
      : filters.sortOrder,
  );
  updateURLParam(
    params,
    "page",
    filters.page > 1 ? String(filters.page) : "",
  );

  const queryString = params.toString();

  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;

  if (window.location.search === (queryString ? `?${queryString}` : "")) {
    return;
  }

  if (actionType === HistoryAction.PUSH) {
    window.history.pushState({ ...filters }, "", newUrl);
  } else {
    window.history.replaceState({ ...filters }, "", newUrl);
  }
}

function paginate<T>(
  data: T[],
  page: number,
  pageSize: number,
): PaginationState<T> {
  if (pageSize <= 0) {
    throw new Error("pageSize must be greater than 0");
  }

  const totalItems = data.length;

  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const start = (currentPage - 1) * pageSize;

  return {
    items: data.slice(start, start + pageSize),
    totalItems,
    totalPages,
    currentPage,
  };
}

// ==========================================
// 3. ZUSTAND APPLICATION STORE
// ==========================================

interface StudentStore {
  filters: FilterState;
  setFilters: (
    updater:
      | Partial<FilterState>
      | ((prev: FilterState) => Partial<FilterState>),
    historyAction?: THistoryAction,
  ) => void;
  resetFilters: () => void;
  syncFromURL: () => void;
}

const useStudentStore = create<StudentStore>((set) => ({
  filters: getFiltersFromURL(),

  setFilters: (updater, historyAction = HistoryAction.PUSH) =>
    set((state) => {
      const nextChanges =
        typeof updater === "function" ? updater(state.filters) : updater;
      const updatedFilters = { ...state.filters, ...nextChanges };

      // Auto-revert to page 1 if changing criteria without explicit page context
      if (!("page" in nextChanges)) {
        updatedFilters.page = 1;
      }

      setURLFromFilters(updatedFilters, historyAction);
      return { filters: updatedFilters };
    }),

  resetFilters: () => {
    setURLFromFilters(DEFAULT_FILTERS, HistoryAction.PUSH);
    set({ filters: DEFAULT_FILTERS });
  },

  syncFromURL: () => {
    console.log("Sync URL  ..............");
    set({ filters: getFiltersFromURL() });
  },
}));

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

interface UsePaginationOptions {
  page: number;
  pageSize: number;
}

function usePagination<T>(data: T[], { page, pageSize }: UsePaginationOptions) {
  return useMemo(() => paginate(data, page, pageSize), [data, page, pageSize]);
}

// ==========================================
// 4. MAIN USER INTERFACE COMPONENT
// ==========================================
export function Three() {
  const { filters, setFilters, resetFilters, syncFromURL } = useStudentStore();
  const [localSearch, setLocalSearch] = useState(filters.search);

  const isSyncingFromHistoryRef = useRef(false);

  const debouncedSearch = useDebounce(localSearch, 500);

  // Sync state back to Zustand on Browser History Navigation Events (Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      console.log("handlePopState ..........");
      isSyncingFromHistoryRef.current = true;

      syncFromURL();

      const filters = getFiltersFromURL();

      setLocalSearch(filters.search);
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [syncFromURL]);

  useEffect(() => {
    if (debouncedSearch === filters.search) {
      return;
    }

    if (isSyncingFromHistoryRef.current) {
      isSyncingFromHistoryRef.current = false;
      return;
    }

    setFilters(
      {
        search: debouncedSearch,
      },
      HistoryAction.PUSH,
    );
  }, [debouncedSearch, filters.search, setFilters]);

  // Data Pipeline Engine: Filter -> Sort
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...DUMMY_STUDENTS];

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query),
      );
    }

    if (filters.department !== "All") {
      result = result.filter((s) => s.department === filters.department);
    }

    result.sort((a, b) => {
      const fieldA = a[filters.sortBy];
      const fieldB = b[filters.sortBy];

      if (typeof fieldA === "string") {
        return filters.sortOrder === "asc"
          ? (fieldA as string).localeCompare(fieldB as string)
          : (fieldB as string).localeCompare(fieldA as string);
      }
      return filters.sortOrder === "asc"
        ? (fieldA as number) - (fieldB as number)
        : (fieldB as number) - (fieldA as number);
    });

    return result;
  }, [filters.search, filters.department, filters.sortBy, filters.sortOrder]);

  const {
    items: paginatedStudents,
    totalItems,
    totalPages,
    currentPage: safePage,
  } = usePagination(filteredAndSortedStudents, {
    page: filters.page,
    pageSize: ITEMS_PER_PAGE,
  });

  const handleSort = (field: typeof filters.sortBy) => {
    setFilters(
      (prev) => ({
        sortBy: field,
        sortOrder:
          prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      }),
      HistoryAction.PUSH,
    ); // Push sorting state to history
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 sm:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Dashboard section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Student Analytics Roster
            </h1>
            <p className="text-slate-500 mt-1">
              Reactive deep state parsing aligned seamlessly with live URL
              architecture.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="self-start sm:self-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            Reset Filters
          </button>
        </div>

        {/* Dynamic Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Search Students
            </label>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters(
                  { department: e.target.value as Department | "All" },
                  HistoryAction.PUSH,
                )
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Business">Business</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          <div className="flex items-end justify-end p-2 text-sm text-slate-500 font-medium">
            Showing {totalItems === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}{" "}
            - {Math.min(safePage * ITEMS_PER_PAGE, totalItems)} of {totalItems}{" "}
            entries
          </div>
        </div>

        {/* Table Presentation View Layer */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 select-none">
                  <th
                    onClick={() => handleSort("name")}
                    className="p-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    Name{" "}
                    {filters.sortBy === "name" &&
                      (filters.sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Department</th>
                  <th
                    onClick={() => handleSort("gpa")}
                    className="p-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    GPA{" "}
                    {filters.sortBy === "gpa" &&
                      (filters.sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("enrollmentDate")}
                    className="p-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    Enrollment Date{" "}
                    {filters.sortBy === "enrollmentDate" &&
                      (filters.sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="p-4 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="p-4 text-slate-500">{student.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {student.department}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-emerald-600">
                        {student.gpa.toFixed(2)}
                      </td>
                      <td className="p-4 text-slate-500">
                        {student.enrollmentDate}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-12 text-center text-slate-400 font-medium bg-slate-50/30"
                    >
                      No matching student matrix records discovered. Try
                      resetting filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Navigation Control Board */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <button
                disabled={safePage === 1}
                onClick={() =>
                  setFilters({ page: safePage - 1 }, HistoryAction.PUSH)
                }
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md shadow-sm text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                Previous
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setFilters({ page: pageNum }, HistoryAction.PUSH)
                      }
                      className={`h-8 w-8 text-xs font-bold rounded-md transition-all ${
                        safePage === pageNum
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>

              <button
                disabled={safePage === totalPages}
                onClick={() =>
                  setFilters({ page: safePage + 1 }, HistoryAction.PUSH)
                }
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md shadow-sm text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Three;


function updateURLParam(
  params: URLSearchParams,
  key: string,
  value: string,
) {
  if (!value) {
    params.delete(key);
    return;
  }

  params.set(key, value);
}