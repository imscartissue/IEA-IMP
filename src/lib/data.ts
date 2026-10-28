import raw from "@/data/schools.json";

import type { Dataset, RedFlag, School, SchoolType } from "@/lib/types";

/**
 * The only module in the app that imports the data file.
 *
 * Two deliberate choices here:
 *
 * 1. `schools.json` is imported directly rather than fetched. There is no API,
 *    so a fetch layer would add a loading state, a skeleton, an error path and
 *    a request for 5.4 kB gzipped. The data is inlined into the JS chunk.
 *
 * 2. The indexes below are built at MODULE SCOPE, once for the lifetime of the
 *    app — not in a hook, not in a selector, not per render. `getSchool` is O(1)
 *    and never re-computes.
 *
 * Every score, rank and band lives in `schools.json` itself.
 * There is no scoring arithmetic in the browser
 * by design: the numbers are data, not logic, so a component cannot mis-apply a
 * weight and two pages cannot disagree.
 */

const data = raw as Dataset;

export const meta = data.meta;

/** All schools, in rank order ascending. Keep this order when editing the data. */
export const schools: readonly School[] = data.schools;

/**
 * The curated red-flag list, in the order it was supplied.
 *
 * Not a subset of `schools`: a flagged school may not be in the ranked roster.
 * The `/rankings` red-flags view renders these by name, with no rank or score.
 */
export const redFlags: readonly RedFlag[] = data.redFlags;

const byId = new Map<number, School>(schools.map((s) => [s.id, s]));
const redFlagById = new Map(redFlags.map((r) => [r.id, r]));

/** "Ullens School" -> "ullens-school" */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const bySlug = new Map<string, School>(schools.map((s) => [slugify(s.name), s]));

/**
 * Resolve a `/school/:id` param. Returns `undefined` for a bad id, a
 * non-numeric id, or an id that does not exist — the caller renders the 404 in
 * place rather than redirecting, so the reader keeps their place.
 */
export function getSchool(id: string | number | undefined | null): School | undefined {
  if (id === undefined || id === null) return undefined;
  const n = typeof id === "number" ? id : Number(id);
  if (!Number.isInteger(n)) return undefined;
  return byId.get(n);
}

/** Lookup by name slug. Used by the sitemap and by tests. */
export function getSchoolBySlug(slug: string): School | undefined {
  return bySlug.get(slug);
}

/**
 * Resolve a `/red-flag/:id` param. Returns `undefined` for an unknown id, so
 * the page renders the 404 in place rather than redirecting.
 */
export function getRedFlag(id: string | undefined | null): RedFlag | undefined {
  if (!id) return undefined;
  return redFlagById.get(id);
}

/** The top N schools. `schools` is already rank-ordered, so this is a slice. */
export function topSchools(n: number): School[] {
  return schools.slice(0, n);
}

/** Schools immediately either side of `school` in rank order. */
export function neighbours(school: School): { before?: School; after?: School } {
  return {
    before: school.rank > 1 ? schools[school.rank - 2] : undefined,
    after: school.rank < schools.length ? schools[school.rank] : undefined,
  };
}

/** Distinct values of a field, in the order they first appear. */
export function distinctTypes(): SchoolType[] {
  return [...new Set(schools.map((s) => s.type))];
}

/**
 * Distribution of scores by band, for the "how to read this" section.
 * Computed once at module scope for the same reason as the indexes.
 */
export const bandCounts = schools.reduce<Record<string, number>>(
  (acc, s) => {
    acc[s.band] = (acc[s.band] ?? 0) + 1;
    return acc;
  },
  { strong: 0, fair: 0, weak: 0 },
);

/** Mean responses per school, one decimal. Used on /about. */
export const meanResponses =
  Math.round((schools.reduce((a, s) => a + s.responses, 0) / schools.length) * 10) / 10;

export const totalSchools = schools.length;
