export const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Business", "Data Science"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface Student {
  id: string;
  name: string;
  email: string;
  department: Department;
  gpa: number;
  enrollmentDate: string;
}

export const SORT_FIELDS = ["name", "gpa", "enrollmentDate"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export interface FilterState {
  search: string;
  department: Department | "All";
  sortBy: (typeof SORT_FIELDS)[number];
  sortOrder: (typeof SORT_ORDERS)[number];
  page: number;
}
