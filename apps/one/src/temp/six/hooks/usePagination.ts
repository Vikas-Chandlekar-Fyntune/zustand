import { useMemo } from "react";

export interface PaginationState<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export function paginate<T>(data: T[], page: number, pageSize: number): PaginationState<T> {
  if (pageSize <= 0) throw new Error("pageSize must be greater than 0");
  const totalItems = data.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  return { items: data.slice(start, start + pageSize), totalItems, totalPages, currentPage };
}

export function usePagination<T>(data: T[], opts: { page: number; pageSize: number }) {
  return useMemo(() => paginate(data, opts.page, opts.pageSize), [data, opts.page, opts.pageSize]);
}
