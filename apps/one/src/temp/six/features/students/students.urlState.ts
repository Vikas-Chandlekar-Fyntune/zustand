import {
  enumField,
  numberField,
  stringField,
} from "../../lib/url-state/codecs";
import {
  DEPARTMENTS,
  SORT_FIELDS,
  SORT_ORDERS,
  type FilterState,
} from "./students.types";
import { createURLStateStore, type Schema } from "../../lib/url-state";

/** The ONLY place that knows which query params exist. */
export const studentFilterSchema: Schema<FilterState> = {
  search: stringField(""),
  department: enumField(["All", ...DEPARTMENTS] as const, "All"),
  sortBy: enumField(SORT_FIELDS, "name"),
  sortOrder: enumField(SORT_ORDERS, "asc"),
  page: numberField(1, { min: 1, integer: true }),
};

export const {
  useStore: useStudentFilters,
  useSyncWithHistory: useStudentFiltersHistorySync,
} = createURLStateStore<FilterState>({
  schema: studentFilterSchema,
  // Domain rule: any change that doesn't explicitly set `page` goes back to page 1
  normalize: (next, changes) =>
    "page" in changes ? next : { ...next, page: 1 },
});
