import { useMemo } from "react";
import { Link } from "react-router";

import { Monogram } from "@/components/data-display/Monogram";
import { RedFlagAmbience } from "@/components/red-flags/RedFlagAmbience";
import { redFlags } from "@/lib/data";

/**
 * Fisher–Yates shuffle over a fresh copy, so the source array is never
 * mutated and every element has an equal chance at every position.
 */
function shuffled<T>(list: readonly T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * The curated red-flag list, in a different order on every load.
 *
 * **No rank, no score.** The red-flag list is a separate set of schools with
 * published reasons, not a slice of the ranking. Shuffling is deliberate: a
 * fixed order would imply a severity ranking the site does not make, and a
 * repeat visitor should not see the same school first every time.
 *
 * Rendered on the `/rankings` red-flags view as a responsive grid of cards —
 * one column on a phone, two on `sm`, three on `lg`. Each card is a bordered
 * box with canvas-coloured gaps between them, so an incomplete last row never
 * leaves a dark void behind.
 */
export function RedFlagList() {
  // Shuffled once per mount. A full page reload is a new mount, so the order
  // changes on every reload — the behaviour the page is specified to have.
  const list = useMemo(() => shuffled(redFlags), []);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <RedFlagAmbience />
      </div>
      <ul className="red-flag-list grid grid-cols-1 gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((redFlag) => (
        <li key={redFlag.id}>
          <Link
            to={`/red-flag/${redFlag.id}`}
            className="red-flag-card block h-full p-6 border border-rule-soft bg-canvas transition-colors hover:bg-bronze-wash"
          >
            <div className="flex items-center gap-3">
              <Monogram name={redFlag.name} size="lg" />
              <span className="min-w-0 flex-1 truncate font-serif text-[1rem] font-bold text-ink hover:underline">
                {redFlag.name}
              </span>
            </div>
            <p className="type-caption mt-2 line-clamp-2 text-ink-muted">
              {redFlag.reasons[0] ?? "Published reasons pending."}
            </p>
            <span className="type-caption mt-2 block text-ink-faint">
              {redFlag.reasons.length} reason{redFlag.reasons.length === 1 ? "" : "s"} · Read more →
            </span>
          </Link>
        </li>
      ))}
      </ul>
    </>
  );
}
