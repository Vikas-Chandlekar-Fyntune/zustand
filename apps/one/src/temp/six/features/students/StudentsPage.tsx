import { useMemo } from "react";
import { DUMMY_STUDENTS } from "./students.data";
import { DEPARTMENTS, type Department, type FilterState, type Student } from "./students.types";
import { useStudentFilters, useStudentFiltersHistorySync } from "./students.urlState";
import { useDebouncedField } from "../../hooks/useDebouncedField";
import { usePagination } from "../../hooks/usePagination";

const ITEMS_PER_PAGE = 5;

// Pure data pipeline: easy to unit test, knows nothing about the URL
// eslint-disable-next-line react-refresh/only-export-components
export function filterAndSortStudents(students: Student[], f: FilterState): Student[] {
  let result = [...students];

  const query = f.search.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (s) => s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query),
    );
  }
  if (f.department !== "All") {
    result = result.filter((s) => s.department === f.department);
  }

  const dir = f.sortOrder === "asc" ? 1 : -1;
  result.sort((a, b) => {
    const A = a[f.sortBy];
    const B = b[f.sortBy];
    return typeof A === "string"
      ? dir * A.localeCompare(B as string)
      : dir * ((A as number) - (B as number));
  });

  return result;
}

export function StudentsPage() {
  useStudentFiltersHistorySync();
  const { state: filters, set: setFilters, reset } = useStudentFilters();

  const [localSearch, setLocalSearch] = useDebouncedField(
    filters.search,
    (search) => setFilters({ search }),
    500,
  );

  const filtered = useMemo(
    () => filterAndSortStudents(DUMMY_STUDENTS, filters),
    [filters.search, filters.department, filters.sortBy, filters.sortOrder],
  );

  const { items, totalItems, totalPages, currentPage: safePage } = usePagination(filtered, {
    page: filters.page,
    pageSize: ITEMS_PER_PAGE,
  });

  const handleSort = (field: FilterState["sortBy"]) =>
    setFilters((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));

  const sortArrow = (field: FilterState["sortBy"]) =>
    filters.sortBy === field ? (filters.sortOrder === "asc" ? "▲" : "▼") : null;

  const thSortable =
    "p-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors";
  const pagerBtn =
    "px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md shadow-sm text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none";
  const fieldCls =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 sm:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Analytics Roster</h1>
            <p className="text-slate-500 mt-1">Schema-driven state kept in sync with the URL.</p>
          </div>
          <button
            onClick={() => reset()}
            className="self-start sm:self-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Search Students</label>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by name or email..."
              className={fieldCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ department: e.target.value as Department | "All" })}
              className={fieldCls}
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-end p-2 text-sm text-slate-500 font-medium">
            Showing {totalItems === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(safePage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 select-none">
                  <th onClick={() => handleSort("name")} className={thSortable}>Name {sortArrow("name")}</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Department</th>
                  <th onClick={() => handleSort("gpa")} className={thSortable}>GPA {sortArrow("gpa")}</th>
                  <th onClick={() => handleSort("enrollmentDate")} className={thSortable}>
                    Enrollment Date {sortArrow("enrollmentDate")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.length > 0 ? (
                  items.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">{s.name}</td>
                      <td className="p-4 text-slate-500">{s.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {s.department}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-emerald-600">{s.gpa.toFixed(2)}</td>
                      <td className="p-4 text-slate-500">{s.enrollmentDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-medium bg-slate-50/30">
                      No matching students found. Try resetting filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <button disabled={safePage === 1} onClick={() => setFilters({ page: safePage - 1 })} className={pagerBtn}>
                Previous
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setFilters({ page: n })}
                    className={`h-8 w-8 text-xs font-bold rounded-md transition-all ${
                      safePage === n
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button disabled={safePage === totalPages} onClick={() => setFilters({ page: safePage + 1 })} className={pagerBtn}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentsPage;
