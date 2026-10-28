import { schools } from "@/lib/data";
import type { Band, School, SchoolType } from "@/lib/types";

/**
 * Filtering, sorting, and URL serialisation for `/rankings`.
 *
 * Pure functions, no React, no table library.
 *
 * This replaces `@tanstack/react-table`, which measured **21.3 kB gzipped**
 * (see docs/01-STACK.md § Rejected). For 42 pre-sorted rows, one sort key and
 * three filters, everything below is a `filter` and a `comparator` — writing it
 * out is smaller, faster, fully typed, and has no opinions about column
 * definitions. The trade is deliberate: see docs/01-STACK.md.
 *
 * Everything is URL-backed, so a filtered view is shareable and the back button
 * behaves. See `hooks/useRankings.ts`.
 */

/* -------------------------------------------------------------------------- */
/* State shape                                                                 */
/* -------------------------------------------------------------------------- */

export type ColumnKey =
  | "rank"
  | "school"
  | "type"
  | "env"
  | "infra"
  | "cost"
  | "benefit"
  | "score";

/** Every column, in display order. Order is fixed; visibility is not. */
export const ALL_COLUMNS: ColumnKey[] = [
  "rank",
  "school",
  "type",
  "env",
  "infra",
  "cost",
  "benefit",
  "score",
];

/** The two that are always present. A table with neither is not a table. */
export const REQUIRED_COLUMNS: ColumnKey[] = ["school", "score"];

export const DEFAULT_COLUMNS: ColumnKey[] = ALL_COLUMNS;

export type Filters = {
  /** Free text over name, shortName and location. */
  q: string;
  type: SchoolType | "all";
  band: Band | "all";
};

export const DEFAULT_FILTERS: Filters = { q: "", type: "all", band: "all" };

/**
 * Which pool of schools the table shows.
 *
 * `redflags` now renders the curated red-flag list (see `src/lib/data.ts`) — a
 * separate set of schools with no rank or score, not the bottom of the table.
 * `all` is the full ranked table, with search/sort/filters on top.
 */
export type View = "redflags" | "all";

export const DEFAULT_VIEW: View = "redflags";

const VIEWS = new Set<string>(["redflags", "all"]);

/**
 * Sort keys. The `cost` key sorts on the INVERTED desirability score, not the
 * raw cost rating — see `comparator` below. That distinction is the whole reason
 * this file exists rather than a generic sort.
 */
export type SortKey =
  | "rank"
  | "name"
  | "score"
  | "-score"
  | "env"
  | "-env"
  | "infra"
  | "-infra"
  | "cost"
  | "-cost"
  | "benefit"
  | "-benefit";

export const DEFAULT_SORT: SortKey = "rank";

/**
 * The sort menu, in display order.
 *
 * **Order within a column matters.** `HeadCell` uses the first matching entry
 * for a column as the direction to switch to on the first click, so each
 * column's *best-first* option must come first. Clicking "Net Cost" should show
 * the best value, not the worst.
 *
 * The direction convention the comparator in `applySort` relies on:
 *   no `-`  ->  ascending   ->  lowest value first
 *   `-`     ->  descending  ->  highest value first
 * and for every metric column a HIGH value is the better result (cost is stored
 * pre-inverted), so "high to low" always means "best first".
 */
export const SORTS: { key: SortKey; label: string; column: ColumnKey }[] = [
  { key: "rank", label: "Rank: high to low", column: "rank" },
  { key: "name", label: "Name: A to Z", column: "school" },
  { key: "-score", label: "Overall score: high to low", column: "score" },
  { key: "score", label: "Overall score: low to high", column: "score" },
  { key: "-env", label: "School Environment: high to low", column: "env" },
  { key: "env", label: "School Environment: low to high", column: "env" },
  { key: "-infra", label: "Infrastructure: high to low", column: "infra" },
  { key: "infra", label: "Infrastructure: low to high", column: "infra" },
  // High desirability first == best value first, because `categories.cost` is
  // already `100 - rawCost`.
  { key: "-cost", label: "Net Cost: best value first", column: "cost" },
  { key: "cost", label: "Net Cost: worst value first", column: "cost" },
  { key: "-benefit", label: "Net Benefit: high to low", column: "benefit" },
  { key: "benefit", label: "Net Benefit: low to high", column: "benefit" },
];

const SORTS_BY_KEY = new Map<string, (typeof SORTS)[number]>(SORTS.map((s) => [s.key, s]));

/** Human label for a sort key, for the toolbar trigger and the URL summary. */
export function sortLabel(key: SortKey): string {
  return SORTS_BY_KEY.get(key)?.label ?? SORTS_BY_KEY.get(DEFAULT_SORT)?.label ?? "";
}

/* -------------------------------------------------------------------------- */
/* Filtering                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Lowercase, strip diacritics, collapse whitespace.
 *
 * Diacritic-insensitive because a reader may type "Kasthamandap" for
 * "Kaasthamandap", or paste a name from a document that carries combining
 * marks. Both must find the same school.
 */
export function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    // Explicit escapes, not literal characters: the combining-diacritical range
    // U+0300-036F is invisible in source and trivially mangled by an editor.
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pre-normalised haystack, computed once per school at module scope.
 *
 * Without this, every keystroke re-normalises 42 × 3 strings. With it, the
 * filter is a substring test against a cached string.
 */
const haystacks = new Map<number, string>(
  schools.map((s) => [s.id, normalise(`${s.name} ${s.shortName} ${s.location}`)]),
);

export function matchesQuery(school: School, query: string): boolean {
  const q = normalise(query);
  if (!q) return true;
  const hay = haystacks.get(school.id);
  return hay !== undefined && hay.includes(q);
}

export function applyFilters(list: readonly School[], filters: Filters): School[] {
  const { q, type, band } = filters;
  if (!q && type === "all" && band === "all") return [...list];
  return list.filter(
    (s) =>
      (type === "all" || s.type === type) &&
      (band === "all" || s.band === band) &&
      matchesQuery(s, q),
  );
}

/* -------------------------------------------------------------------------- */
/* Sorting                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The value a sort key orders by.
 *
 * Note `cost`. The raw metric is `metrics.cost`, where LOW is good. The
 * precomputed `categories.cost` is already inverted to a 0-100 desirability
 * where HIGH is good. Every other key is "high is good", so `cost` uses
 * `categories.cost` too — that makes one rule hold for the whole table:
 *
 *   > ascending sort = "least good first" for every single column.
 *
 * Getting this wrong is subtle and user-visible: sorting the raw cost column
 * ascending would put the most expensive school on top, under a column labelled
 * "Net Cost: best value first".
 */
function sortValue(school: School, key: SortKey): number | string {
  switch (key) {
    case "rank":
      return school.rank;
    case "name":
      return school.name;
    case "score":
    case "-score":
      return school.overallScore;
    case "env":
    case "-env":
      return school.categories.environment;
    case "infra":
    case "-infra":
      return school.categories.infrastructure;
    case "cost":
    case "-cost":
      return school.categories.cost; // already inverted
    case "benefit":
    case "-benefit":
      return school.categories.benefit;
  }
}

export function applySort(list: readonly School[], key: SortKey): School[] {
  const descending = key.startsWith("-");
  // `key` is a closed union, so stripping the leading "-" still yields a
  // member of it. The cast states that; it cannot be wrong at runtime.
  const base = (descending ? key.slice(1) : key) as SortKey;
  const byName = base === "name";

  return [...list].sort((a, b) => {
    const av = sortValue(a, base);
    const bv = sortValue(b, base);
    const cmp = byName
      ? String(av).localeCompare(String(bv), "en")
      : (av as number) - (bv as number);
    if (cmp !== 0) return descending ? -cmp : cmp;
    // Ties break on rank, so the order is stable and matches the published
    // ranking rather than depending on the input order.
    return a.rank - b.rank;
  });
}

/**
 * Filter then sort, in one call. The order matters: sort the smaller set.
 *
 * The pool is always the full roster. The red-flags view is a separate curated
 * list (`src/lib/data.ts`) and does not go through the table at all, so there is
 * no view parameter here anymore.
 */
export function selectSchools(filters: Filters, sort: SortKey): School[] {
  return applySort(applyFilters(schools, filters), sort);
}

/* -------------------------------------------------------------------------- */
/* URL serialisation                                                           */
/* -------------------------------------------------------------------------- */

const COLUMN_SET = new Set<string>(ALL_COLUMNS);
const SORT_SET = new Set<string>(SORTS.map((s) => s.key));
const TYPES = new Set<string>(["all", "Public", "Private"]);
const BANDS = new Set<string>(["all", "strong", "fair", "weak"]);

/**
 * Read state out of the query string.
 *
 * Every value is validated against a known set. A hand-edited or stale URL
 * (`?sort=;drop+table&type=banana`) must degrade to the default, never reach
 * the comparator and never throw.
 */
export function parseParams(params: URLSearchParams): {
  filters: Filters;
  sort: SortKey;
  columns: ColumnKey[];
  view: View;
} {
  const q = params.get("q") ?? "";
  const rawType = params.get("type") ?? "all";
  const rawBand = params.get("band") ?? "all";
  const rawSort = params.get("sort") ?? DEFAULT_SORT;
  const rawView = params.get("view") ?? DEFAULT_VIEW;

  const filters: Filters = {
    q: q.slice(0, 120),
    type: (TYPES.has(rawType) ? rawType : "all") as Filters["type"],
    band: (BANDS.has(rawBand) ? rawBand : "all") as Filters["band"],
  };

  const sort = (SORT_SET.has(rawSort) ? rawSort : DEFAULT_SORT) as SortKey;

  // Unknown views fall back to the default rather than an empty table. There
  // is no third view, so anything unrecognised is a stale or hand-edited URL.
  const view = (VIEWS.has(rawView) ? rawView : DEFAULT_VIEW) as View;

  const rawCols = params.get("cols");
  let columns = DEFAULT_COLUMNS;
  if (rawCols) {
    const parsed = rawCols
      .split(",")
      .map((c) => c.trim())
      .filter((c): c is ColumnKey => COLUMN_SET.has(c));
    // The required columns can never be hidden, and a hidden-everything URL
    // would render an empty table.
    if (parsed.length > 0) {
      columns = ALL_COLUMNS.filter((c) => parsed.includes(c) || REQUIRED_COLUMNS.includes(c));
    }
  }

  return { filters, sort, columns, view };
}

/** Write state back to a query string, omitting anything at its default. */
export function serialiseParams(
  filters: Filters,
  sort: SortKey,
  columns: ColumnKey[],
  view: View = DEFAULT_VIEW,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.band !== "all") params.set("band", filters.band);
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  if (columns.join() !== DEFAULT_COLUMNS.join()) params.set("cols", columns.join(","));
  // The default view is the absence of the param, so a plain `/rankings` link
  // is the red-flags view and only `view=all` is ever written.
  if (view !== DEFAULT_VIEW) params.set("view", view);
  return params;
}

export function isDefaultState(
  filters: Filters,
  sort: SortKey,
  columns: ColumnKey[],
  view: View = DEFAULT_VIEW,
): boolean {
  return (
    filters.q === "" &&
    filters.type === "all" &&
    filters.band === "all" &&
    sort === DEFAULT_SORT &&
    columns.length === DEFAULT_COLUMNS.length &&
    view === DEFAULT_VIEW
  );
}
