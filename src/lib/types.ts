/**
 * Shapes of `src/data/schools.json`, the data file the app reads.
 * Scores, ranks and bands are stored in the JSON itself.
 */

/** A single 0-100 metric as reported in the survey. */
export type Metric = {
  /** Atmosphere, culture, student life. Weight 0.30. */
  schoolEnvironment: number;
  /** Classrooms, labs, library, sports, tech. Weight 0.20. */
  infrastructure: number;
  /** Raw cost rating, 0-100. INVERTED before scoring: lower is better. */
  cost: number;
  /** Post-graduation outcomes, placement, alumni. Weight 0.30. */
  netBenefit: number;
};

/** Per-category desirability scores. `complaint` is always null — never scored. */
export type CategoryScores = {
  environment: number;
  infrastructure: number;
  /** Already inverted: `100 - metrics.cost`. */
  cost: number;
  benefit: number;
  /** `null` by design. No complaint data was collected. */
  complaint: null;
};

/** Categorical score band. Drives colour and the plain-language verdict. */
export type Band = "strong" | "fair" | "weak";

/** The five table columns/axes, in display order. */
export type CategoryKey = "environment" | "infrastructure" | "cost" | "benefit" | "complaint";

export type SchoolType = "Public" | "Private";

export type School = {
  id: number;
  /** 1-based, assigned at build time. `schools[0].rank === 1`. */
  rank: number;
  name: string;
  /** Short display name, e.g. "BNKS". */
  shortName: string;
  /** Monogram letters, e.g. "BN". */
  initials: string;
  /** Legacy per-school accent from the original site, kept for reference. */
  logoColor: string;
  type: SchoolType;
  gradeRange: string;
  location: string;
  /** Registered complaint text, or `null` when none was collected. */
  complaint: string | null;
  metrics: Metric;
  categories: CategoryScores;
  /**
   * How many students named this school in the raw survey.
   * `0` means the school was scored from the Excel master sheet but no raw
   * response named it. The UI must say so rather than hide it.
   */
  responses: number;
  /** Weighted 0-100, one decimal. Precomputed. */
  overallScore: number;
  band: Band;
};

/**
 * A scored dimension, as published in `meta.categories`.
 *
 * Note the build script strips the internal `metrics` wiring before writing
 * the JSON — this is the reader-facing description only.
 */
export type CategoryMeta = {
  key: CategoryKey;
  label: string;
  blurb: string;
  /** Displayed as "lower is better". */
  invert?: boolean;
  /** Not part of the score at all. */
  unscored?: boolean;
};

export type Meta = {
  publicationDate: string;
  edition: string;
  title: string;
  subtitle: string;
  source: string;
  totalSchools: number;
  /** Rows in the raw survey that had a school name. */
  totalResponses: number;
  /** Rows we could attribute to a published school. */
  attributedResponses: number;
  /** Rows with a score in the school-name column — cannot be attributed. */
  unattributedResponses: number;
  /** Schools that were surveyed but never published. */
  surveyedButUnpublished: number;
  location: string;
  gradeRange: string;
  weights: Record<string, number>;
  categories: CategoryMeta[];
};

/**
 * A school carried on the red-flag list.
 *
 * Deliberately NOT a `School`: it has no score, no rank and no band, and it may
 * not exist in the ranked roster at all (e.g. CCRC College and Kavya). The
 * red-flag page is a separate curated list, not a filtered view of the table.
 */
export type RedFlag = {
  /** Stable identifier, also the URL slug: `/red-flag/:id`. */
  id: string;
  /** Display name, as supplied in the source document. */
  name: string;
  /** The published reasons for flagging. May be empty while a school awaits detail. */
  reasons: string[];
};

export type Dataset = {
  meta: Meta;
  schools: School[];
  /** The curated red-flag list. Order is the source order; the UI shuffles it. */
  redFlags: RedFlag[];
};

/**
 * A person credited on the site. See `src/data/contributors.ts`.
 *
 * `name` and `role` may be empty strings while they are being supplied — the UI
 * reserves blank space of the correct size rather than rendering a placeholder
 * name, so filling them in later causes no layout shift. Do not invent values.
 */
export type Contributor = {
  /** Stable identifier, also the image cache key. */
  id: string;
  name: string;
  /** Three words maximum. e.g. "Data & scoring". */
  role: string;
  /**
   * Optional portrait. Rendered as a PORTRAIT (3:4), not a round avatar — see
   * `components/data-display/Portrait.tsx`. Recommended: ~600px wide, <150 kB,
   * placed at `public/people/<id>.jpg`.
   */
  photo?: string;
  /** Required whenever `photo` is set, unless the name is the caption. */
  photoAlt?: string;
  links?: {
    github?: string;
    x?: string;
    linkedin?: string;
    mail?: string;
  };
};
