import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import {
  DEFAULT_COLUMNS,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  DEFAULT_VIEW,
  isDefaultState,
  parseParams,
  serialiseParams,
  selectSchools,
  type ColumnKey,
  type Filters,
  type SortKey,
  type View,
} from "@/lib/filters";
import { schools } from "@/lib/data";

/**
 * URL-backed rankings state.
 *
 * **The URL is the state.** Nothing filter-related lives in React state alone,
 * so a filtered view is shareable, bookmarkable, survives a refresh, and the
 * back button behaves the way a reader expects.
 *
 * `setSearchParams(..., { replace: true })` is deliberate: a reader who sorts
 * three times should need one press of Back to leave the page, not three. Only
 * a "reset" navigation pushes a new history entry.
 */
export function useRankings() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parsed on every render — it is a handful of validated lookups, and doing it
  // inside useMemo keyed on the params object would be ceremony. The expensive
  // part (filter + sort) is memoised below.
  const { filters, sort, columns, view } = useMemo(
    () => parseParams(searchParams),
    [searchParams],
  );

  const rows = useMemo(() => selectSchools(filters, sort), [filters, sort]);

  const commit = useCallback(
    (nextFilters: Filters, nextSort: SortKey, nextColumns: ColumnKey[], nextView: View) => {
      const params = serialiseParams(nextFilters, nextSort, nextColumns, nextView);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const setQuery = useCallback(
    (q: string) => commit({ ...filters, q }, sort, columns, view),
    [commit, filters, sort, columns, view],
  );

  const setType = useCallback(
    (type: Filters["type"]) => commit({ ...filters, type }, sort, columns, view),
    [commit, filters, sort, columns, view],
  );

  const setBand = useCallback(
    (band: Filters["band"]) => commit({ ...filters, band }, sort, columns, view),
    [commit, filters, sort, columns, view],
  );

  const setSort = useCallback(
    (next: SortKey) => commit(filters, next, columns, view),
    [commit, filters, columns, view],
  );

  const setView = useCallback(
    (next: View) => commit(filters, sort, columns, next),
    [commit, filters, sort, columns],
  );

  const toggleColumn = useCallback(
    (key: ColumnKey) => {
      const next = columns.includes(key)
        ? columns.filter((c) => c !== key)
        : DEFAULT_COLUMNS.filter((c) => columns.includes(c) || c === key);
      commit(filters, sort, next, view);
    },
    [commit, filters, sort, columns, view],
  );

  /** Clears everything and PUSHES a history entry, so Back undoes the reset. */
  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const pristine = isDefaultState(filters, sort, columns, view);

  return {
    filters,
    sort,
    columns,
    view,
    rows,
    total: schools.length,
    shown: rows.length,
    isFiltered: !pristine,
    pristine,
    setQuery,
    setType,
    setBand,
    setSort,
    setView,
    toggleColumn,
    reset,
    defaults: { filters: DEFAULT_FILTERS, sort: DEFAULT_SORT, columns: DEFAULT_COLUMNS, view: DEFAULT_VIEW },
  };
}

export type RankingsState = ReturnType<typeof useRankings>;
