/**
 * Formatters. Thin wrappers over `Intl` so date and number rendering is
 * consistent and locale-aware, and so no component calls `Intl` directly.
 */

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * "2026-06-15" -> "15 Jun 2026". The site's publication date is shown on the
 * rankings page, in the footer, and on /about; all three must agree.
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFmt.format(d);
}

/** Machine date for `<time dateTime>`. */
export function isoDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** "42" -> "42", "1" -> "1". Deliberately no thousands separator: these are
 *  small counts and a comma would look like spreadsheet output. */
export function formatCount(n: number): string {
  return String(n);
}

/**
 * "200" -> "200+". For a count that is a floor rather than a census — the
 * survey collected *at least* this many responses, so the headline advertises a
 * lower bound instead of an exact figure.
 */
export function formatCountPlus(n: number): string {
  return `${n}+`;
}

/** "1 school" / "42 schools" */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}
