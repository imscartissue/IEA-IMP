import { meta } from "@/lib/data";
import type { Band, CategoryKey } from "@/lib/types";

/**
 * Display logic for scores. Pure functions, no React.
 *
 * Scores themselves live in `src/data/schools.json`. Nothing here recomputes
 * a score — it only interprets the stored numbers.
 */

/** Score thresholds for the three bands. */
export const BAND_THRESHOLDS = { strong: 75, fair: 50 } as const;

export function band(score: number): Band {
  if (score >= BAND_THRESHOLDS.strong) return "strong";
  if (score >= BAND_THRESHOLDS.fair) return "fair";
  return "weak";
}

export const BAND_LABEL: Record<Band, string> = {
  strong: "Strong",
  fair: "Fair",
  weak: "Weak",
};

/**
 * The published weight for a display category, read from `meta.weights` rather
 * than hardcoded.
 *
 * The weights in the data are keyed by metric name (`netCost`), while the
 * categories a reader sees are keyed by display name (`cost`). This map is the
 * only place that translation exists, so there is exactly one thing to change if
 * the model is ever revised.
 */
const CATEGORY_TO_METRIC = {
  environment: "schoolEnvironment",
  infrastructure: "infrastructure",
  cost: "netCost",
  benefit: "netBenefit",
  complaint: "complaint",
} as const satisfies Record<CategoryKey, string>;

/** e.g. `categoryWeight("environment")` -> 0.3 */
export function categoryWeight(key: CategoryKey): number {
  return meta.weights[CATEGORY_TO_METRIC[key]] ?? 0;
}

/** e.g. `"30%"` */
export function formatWeight(key: CategoryKey): string {
  return `${Math.round(categoryWeight(key) * 100)}%`;
}

/** One-decimal string. `77` -> "77.0", so columns align on the decimal. */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Tailwind class for a band colour. `color-*` works for text and fill; use
 * `bg-*`/`text-*` as appropriate at the call site.
 */
export function bandColor(score: number, use: "text" | "bg" | "border" = "text"): string {
  return `${use}-band-${band(score)}`;
}

/* -------------------------------------------------------------------------- */
/* Monogram colours                                                            */
/* -------------------------------------------------------------------------- */

/**
 * A closed set of six, all at similar value/chroma to the brand so a strip of
 * monograms looks designed rather than like a bag of skittles.
 */
const MONOGRAM_COLORS = [
  "#2f6b4f", // band-strong green
  "#8a6a35", // bronze
  "#3a5a8c", // indigo
  "#7a4a6b", // plum
  "#8c5a3a", // sienna
  "#4a6b8c", // slate blue
];

/**
 * Deterministic colour from a name, so "Ullens School" is always the same
 * swatch across the intro, the top-ten and the school hero. A `Math.random()`
 * here would make the page change on every render.
 */
export function monogramColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return MONOGRAM_COLORS[h % MONOGRAM_COLORS.length] as string;
}
