import type { Contributor } from "@/lib/types";

/**
 * WHO BUILT THIS SITE.
 * ---------------------------------------------------------------------------
 * The intro sequence and `/about` are built around these entries.
 *
 * Add one entry per person. Give it a stable `id` (their GitHub handle or
 * initials works) — the id is used as a React key and as the image cache
 * key, so changing it later re-downloads their photo.
 *
 * `role` is three words maximum. `links` is optional and at most two.
 *
 * Drop photos in `public/people/<id>.jpg` and set `photo`. They are rendered
 * as PORTRAITS, not avatars — see `components/data-display/Portrait.tsx`.
 * Recommended: 3:4 crop, ~600px wide, under 150 kB. The site has no image
 * pipeline, so optimise these by hand.
 *
 * `photoAlt` is optional alt text for the portrait.
 */

/** Real people, credited. */
export const contributors: Contributor[] = [
  { id: "yogeshwor-sharma", name: "Yogeshwor Sharma", role: "Founder, President, & Head of Operations", photo: "/people/yogeshwor-sharma.jpg" },
  { id: "eron-subedi", name: "Eron Subedi", role: "Founder, Chief Architect & Chief of Investigations", photo: "/people/eron-subedi.jpeg" },
  { id: "aarohan-baral", name: "Aarohan Baral", role: "Lead Developer", },
  { id: "tikaram-sharma", name: "Tikaram Sharma", role: "Co-Founder & Statistical Analyst",  },
  { id: "prajjwal-dhakal", name: "Prajjwal Dhakal", role: "Co-Founder", photo: "/people/prajjwal-dhakal.jpeg" },
  { id: "abhinash-poudel", name: "Abinash Poudel", role: "Lead Online Research", photo: "/people/abinash-poudel.jpg" },
  { id: "nischal-ghimire", name: "Nischal Ghimire", role: "Research Executive", photo: "/people/nischal-ghimire.JPG" },
  { id: "kaustuv-rimal", name: "Kaustuv Rimal", role: "Research Executive" },
  { id: "aaditya-jha", name: "Aaditya Jha", role: "Research Executive", photo: "/people/aaditya-jha.jpg" },
  { id: "aishani-rai", name: "Aishani Rai", role: "Editorial Lead", photo: "/people/aishani-rai.jpg" },
  { id: "ashmit-pandey", name: "Ashmit Pandey", role: "Managing Editor and Associate Researcher" },
  { id: "krinjal-timalsina", name: "Krinjal Timalsina", role: "Research Analyst", photo: "/people/krinjal-timalsina.jpeg" },
  { id: "aadarsha-pandey", name: "Aadarsha Pandey", role: "Research Analyst" },
  { id: "piyush-joshi", name: "Piyush Joshi", role: "Research Analyst", photo: "/people/piyush-joshi.jpg" },
  { id: "pratyush-neupane", name: "Pratyush Neupane", role: "Research Analyst", photo: "/people/pratyush-neupane.jpeg" },
  { id: "sambriddhi-bhattarai", name: "Sambriddhi Bhattarai", role: "Research Analyst", photo: "/people/sambriddhi-bhattarai.jpg" },
  { id: "kashyap-shrestha", name: "Kashyap Shrestha", role: "Research Analyst", photo: "/people/kashyap-shrestha.jpeg" },
];

/**
 * How many slots the splash reserves, and therefore how many people it can show.
 *
 * Eight, because that is what can actually be read in the two seconds available
 * and because the design cap is eight (`02-DESIGN-SYSTEM.md § 4`). This constant
 * is the single source of that cap — the strip never hardcodes it.
 *
 * The slots are reserved even when `contributors` is empty. An empty array with
 * no padding would render nothing at all, which reads as a broken splash rather
 * than as credits awaiting names.
 */
export const INTRO_CONTRIBUTOR_SLOTS = 8;

/**
 * The people shown in the intro.
 *
 * Deterministic and evenly spaced, so the same faces appear every time — a
 * `Math.random()` or a `.slice(0, 8)` would look arbitrary and would make the
 * splash feel like a different product each visit.
 */
export function introContributors(): Contributor[] {
  if (contributors.length <= INTRO_CONTRIBUTOR_SLOTS) return contributors;
  const step = contributors.length / INTRO_CONTRIBUTOR_SLOTS;
  return Array.from(
    { length: INTRO_CONTRIBUTOR_SLOTS },
    (_, i) => contributors[Math.floor(i * step)] as Contributor,
  );
}

/**
 * Turn photos on in the intro once they exist.
 *
 * Deliberately separate from `contributors.length`: the intro runs at a size
 * where a portrait's face is ~40px tall, which is a bad use of a portrait. The
 * monogram is the better mark there. Photos belong on `/about`, where they are
 * large enough to be portraits.
 */
export const SHOW_INTRO_PORTRAITS = false;

/** True once there is at least one real name to show. */
export const hasContributorNames = contributors.some((c) => c.name.trim() !== "");

/**
 * The people shown in the intro, padded to a fixed number of slots.
 *
 * Always `INTRO_CONTRIBUTOR_SLOTS` long. Real people fill the first N; the
 * rest are `null`, which the UI renders as a correctly-sized blank slot.
 *
 * The padding is the point. With an empty `contributors` array the splash would
 * otherwise render *nothing* — no circles, no gap, no hint that credits belong
 * there. Reserving the space means the layout a reader sees today is the layout
 * they will see once the real names land, and nothing shifts when it happens.
 */
export function introSlots(): (Contributor | null)[] {
  const real = introContributors();
  return Array.from(
    { length: INTRO_CONTRIBUTOR_SLOTS },
    (_, i) => real[i] ?? null,
  );
}

/** How many real people are not shown individually, for the "+N" chip. */
export function introOverflow(): number {
  return Math.max(0, contributors.length - INTRO_CONTRIBUTOR_SLOTS);
}