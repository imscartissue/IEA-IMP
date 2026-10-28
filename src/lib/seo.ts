import { totalSchools } from "@/lib/data";
import { formatCount } from "@/lib/format";
import type { RedFlag, School } from "@/lib/types";

/**
 * Per-route document title, meta description and canonical URL.
 *
 * Implemented by writing to `document.head` rather than pulling in a
 * react-helmet-style dependency: this is four routes and three fields, and the
 * library would be a larger share of the critical path than the whole SEO
 * feature is worth. See docs/01-STACK.md § Rejected.
 *
 * `index.html` already carries the home title and description, so crawlers and
 * the first paint see them before this module is even loaded.
 */

const SUFFIX = "IEA";

export type Seo = {
  title: string;
  description: string;
  /**
   * Emit `robots: noindex, follow`.
   *
   * Only the 404 sets this. A page that does not exist has no business in a
   * search index, and without the tag Google will happily index a soft 404 and
   * rank it against real school pages for "not found" queries. `follow` is kept
   * so the links out of the page still pass authority to the schools.
   */
  noindex?: boolean;
};

/**
 * A head tag, as data.
 *
 * The point of this type is that the decision of *what* goes in the head is
 * separated from the act of *writing* it to `document.head`. `applySeo` is the
 * only thing that touches the DOM; `headTags` is pure and takes the path and
 * origin as arguments, which means `scripts/check-a11y.mjs` can assert on the
 * real output without a browser and without reimplementing the rules.
 */
export type HeadTag =
  | { tag: "title"; text: string }
  | { tag: "meta"; attr: "name" | "property"; key: string; content: string }
  | { tag: "link"; rel: string; href: string };

function build(pageTitle: string, description: string, extra: Partial<Seo> = {}): Seo {
  return {
    title: pageTitle === SUFFIX ? SUFFIX : `${pageTitle} — ${SUFFIX}`,
    description,
    ...extra,
  };
}

export const SEO = {
  // Home title is the bare brand, deliberately: every other route carries a
  // descriptive title, and the landing tab reads cleanest as just "IEA". The
  // length check in check-a11y.mjs exempts "/" for exactly this reason.
  home: build(
    SUFFIX,
    "An independent examination of Nepali schools, grounded in verified student testimony, field inquiry, and credible public sources, undertaken to illuminate the institutions entrusted with educating the next generation.",
  ),
  rankings: build(
    "Rankings",
    `All ${totalSchools} schools in the survey, with School Environment, Infrastructure, Net Cost and Net Benefit scores. Search, sort and filter the full table.`,
  ),
  methodology: build(
    "Methodology",
    `How the IEA Institute scores were built: the survey, the four dimensions and their weights, the cost inversion, and how ranks are assigned.`,
  ),
  annualReport: build(
    "Annual report",
    `The IEA Institute annual report on the 2026 school survey: the instrument, response rates, the scoring model and the limitations.`,
  ),
  about: build(
    "About",
    `The Institute for Educational Accountability (IEA) advances transparency and accountability in education through field research, school investigations, student surveys, and evidence-based analysis.`,
  ),
  notFound: build(
    "Page not found",
    "That page does not exist. Browse all 42 schools in the IEA Institute rankings, or read how the rankings were built.",
    { noindex: true },
  ),
} as const satisfies Record<string, Seo>;

/**
 * Per-school SEO.
 *
 * A function rather than a shared constant because each of the 42 pages needs
 * its own name, score and description. A generic title across all of them would
 * make the pages indistinguishable in search results — which is the one place
 * where a real title matters.
 */
export function schoolSeo(school: School): Seo {
  const where = school.responses > 0
    ? `Rated by ${formatCount(school.responses)} students.`
    : "Rated in the IEA Institute school survey.";

  return {
    title: `${school.name} — rank ${school.rank}, ${school.overallScore.toFixed(1)}/100`,
    description: `${school.name} ranks ${school.rank} of ${totalSchools} in the IEA Institute survey with an overall score of ${school.overallScore.toFixed(1)} out of 100. ${where}`,
  };
}

/**
 * Per-red-flag SEO.
 *
 * A flagged school has no rank or score, so the title and description are built
 * from the name and the first published reason instead. A generic title across
 * the list would make the pages indistinguishable in search results.
 */
export function redFlagSeo(redFlag: RedFlag): Seo {
  const summary =
    redFlag.reasons.length > 0
      ? `Flagged for: ${redFlag.reasons[0]}${redFlag.reasons.length > 1 ? `, and ${redFlag.reasons.length - 1} more.` : "."}`
      : "Listed on the IEA Institute red-flag list.";

  return {
    title: `${redFlag.name} — red flag`,
    description: `${redFlag.name} is on the IEA Institute red-flag list. ${summary} Read the published reasons and how to respond.`,
  };
}

/* -------------------------------------------------------------------------- */

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.content = content;
  else {
    const meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    meta.content = content;
    document.head.appendChild(meta);
  }
}

function setLink(rel: string, href: string) {
  const el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (el) el.href = href;
  else {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Every head tag a route needs, as data. Pure: no `window`, no `document`.
 *
 * `path` and `origin` are parameters rather than reads of `window.location` for
 * exactly that reason — the static audit renders this output into a synthetic
 * document and checks it.
 *
 * Open Graph tags use `property`, not `name`. The distinction is recorded in
 * the descriptor rather than assumed, because the audit asserts on the rendered
 * attribute and a silent `name` swap would make `og:title` unreadable to some
 * crawlers while still passing a naive `meta[name=...]` check.
 *
 * The canonical is emitted at runtime rather than sitting statically in
 * `index.html`: Vite's HTML plugin tries to resolve `href` values as build
 * assets, and a bare `"/"` in a `<link rel="canonical">` makes the build throw
 * `EISDIR`. See docs/09-BUGS.md § C3.
 */
export function headTags(seo: Seo, path: string, origin: string): HeadTag[] {
  const image = new URL("/og-image.png", origin).toString();
  const tags: HeadTag[] = [
    { tag: "title", text: seo.title },
    { tag: "meta", attr: "name", key: "description", content: seo.description },
    { tag: "meta", attr: "property", key: "og:title", content: seo.title },
    { tag: "meta", attr: "property", key: "og:description", content: seo.description },
    { tag: "meta", attr: "property", key: "og:image", content: image },
    { tag: "meta", attr: "name", key: "twitter:card", content: "summary_large_image" },
    { tag: "meta", attr: "name", key: "twitter:image", content: image },
  ];

  // The home page is the origin itself, so a canonical there would be a
  // redundant self-reference. Every other route needs one to stop `/rankings`
  // and `/rankings?q=foo` competing as separate documents.
  if (path !== "/") {
    const url = new URL(path, origin).toString();
    tags.push(
      { tag: "meta", attr: "property", key: "og:url", content: url },
      { tag: "link", rel: "canonical", href: url },
    );
  }

  if (seo.noindex) {
    tags.push({ tag: "meta", attr: "name", key: "robots", content: "noindex, follow" });
  }

  return tags;
}

/**
 * Apply a route's SEO. Called from an effect on route change, so it runs after
 * first paint — acceptable because the initial document already carries the home
 * tags.
 *
 * This function only writes what `headTags` decided. Keeping the decision pure
 * is what lets `check-a11y.mjs` verify titles, descriptions and canonicals
 * offline; if the logic moved back in here, that check would be asserting a
 * copy of the rules instead of the rules.
 */
export function applySeo(seo: Seo): void {
  if (typeof document === "undefined") return;

  for (const t of headTags(seo, window.location.pathname, window.location.origin)) {
    if (t.tag === "title") {
      document.title = t.text;
    } else if (t.tag === "meta") {
      setMeta(`meta[${t.attr}="${t.key}"]`, t.attr, t.key, t.content);
    } else {
      setLink(t.rel, t.href);
    }
  }
}

/** Absolute URL for a path, with any query string dropped. */
export function canonicalUrl(path = window.location.pathname): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}
