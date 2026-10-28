import { Link } from "react-router";

import { ScoreBar } from "@/components/data-display/ScoreBar";
import { bandColor } from "@/lib/scoring";
import { neighbours } from "@/lib/data";
import type { School } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The schools either side in rank order.
 *
 * A single score is meaningless without context: 40.3 is a good score if
 * everything around it is 38, and a bad one if everything around it is 75. This
 * is the cheapest possible way to supply that context.
 */
export function NeighboursTable({ school }: { school: School }) {
  const { before, after } = neighbours(school);

  if (!before && !after) return null;

  const rows = [
    ...(before ? [before] : []),
    ...(after ? [after] : []),
  ];

  return (
    <section>
      <h2 className="type-label text-ink-faint">Around it in the ranking</h2>

      <ul className="mt-4 flex flex-col border-y border-rule-soft">
        {rows.map((other) => (
          <li key={other.id} className="border-b border-rule-soft last:border-b-0">
            <Link
              to={`/school/${other.id}`}
              className="flex items-center gap-4 py-3 transition-colors hover:bg-bronze-wash"
              aria-label={`Rank ${other.rank}, ${other.name}, overall ${other.overallScore.toFixed(1)}`}
            >
              <span className="w-8 shrink-0 text-right type-numeric-sm text-ink-faint">
                {other.rank}
              </span>

              <span className="min-w-0 flex-1 truncate font-serif text-[0.9375rem] font-bold text-ink hover:underline">
                {other.name}
              </span>

              <span className="hidden w-20 shrink-0 sm:block">
                <ScoreBar
                  value={other.overallScore}
                  size="sm"
                  label={`Overall ${other.overallScore.toFixed(1)}`}
                />
              </span>

              <span className={cn("type-numeric-sm shrink-0", bandColor(other.overallScore))}>
                {other.overallScore.toFixed(1)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="type-caption measure mt-4 text-ink-faint">
        This school is ranked {school.rank}
        {before
          ? `, ${Math.abs(school.overallScore - before.overallScore).toFixed(1)} above the school ranked ${before.rank}`
          : ""}
        {before && after ? ", and" : ""}
        {after
          ? ` ${Math.abs(after.overallScore - school.overallScore).toFixed(1)} below the school ranked ${after.rank}`
          : ""}
        .
      </p>
    </section>
  );
}
