import React, { useEffect, useState, useMemo } from "react";
import { useStudentStore } from "./useStudentStore";
import { DUMMY_STUDENTS, type Department } from "./types";

const ITEMS_PER_PAGE = 5;

export default function App() {
  const { filters, setFilters, resetFilters, syncFromURL } = useStudentStore();

  // Local fast UI state for text input to prevent sluggish re-renders on keystroke
  const [localSearch, setLocalSearch] = useState(filters.search);

  // 1. Listen for browser Back/Forward navigation triggers
  useEffect(() => {
    const handlePopState = () => syncFromURL();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [syncFromURL]);

  // Keep local input in sync if filters change externally (like back button or reset)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // 2. Debounce implementation (500ms) for data querying & URL synchronization
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilters({ search: localSearch });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, setFilters]);

  // 3. Memoized filtering and sorting execution pipeline
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...DUMMY_STUDENTS];

    // Filter by search query
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query),
      );
    }

    // Filter by Department
    if (filters.department !== "All") {
      result = result.filter((s) => s.department === filters.department);
    }

    // Sorting operations
    result.sort((a, b) => {
      let fieldA = a[filters.sortBy];
      let fieldB = b[filters.sortBy];

      if (typeof fieldA === "string") {
        return filters.sortOrder === "asc"
          ? (fieldA as string).localeCompare(fieldB as string)
          : (fieldB as string).localeCompare(fieldA as string);
      }

      // Numeric comparisons (GPA)
      return filters.sortOrder === "asc"
        ? (fieldA as number) - (fieldB as number)
        : (fieldB as number) - (fieldA as number);
    });

    return result;
  }, [filters.search, filters.department, filters.sortBy, filters.sortOrder]);

  // 4. Client Side Pagination Slicing with safe range fallbacks
  const totalItems = filteredAndSortedStudents.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // Edge Case Handling: Guard out-of-bounds page routing indexes safely
  const safePage = filters.page > totalPages ? totalPages : filters.page;

  const paginatedStudents = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedStudents, safePage]);

  const handleSort = (field: typeof filters.sortBy) => {
    setFilters((prev) => ({
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
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
          {/* Debounced Search Filter */}
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

          {/* Department Filter Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters({ department: e.target.value as Department | "All" })
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

          {/* Result Metric Header */}
          <div className="flex items-end justify-end p-2 text-sm text-slate-500 font-medium">
            Showing {totalItems === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}{" "}
            - {Math.min(safePage * ITEMS_PER_PAGE, totalItems)} of {totalItems}{" "}
            entries
          </div>
        </div>

        {/* Main Data Presentation View Layer */}
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
                onClick={() => setFilters({ page: safePage - 1 })}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md shadow-sm text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                Previous
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setFilters({ page: pageNum })}
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
                onClick={() => setFilters({ page: safePage + 1 })}
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
