import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { ScoreBar } from "@/components/data-display/ScoreBar";
import { StatBlock } from "@/components/data-display/StatBlock";
import { bandColor } from "@/lib/scoring";
import { formatCount, formatCountPlus, formatDate } from "@/lib/format";
import { meta, redFlags, schools, totalSchools } from "@/lib/data";

/**
 * The landing masthead.
 *
 * Editorial, not marketing. The headline is a claim the data supports, and the
 * only decoration is a single hairline above the fold. No illustration, no hero
 * image, no gradient — all three would fight the type, and the type is the
 * design.
 *
 * The red-flag and top-of-table lists live here, in the same card/row design
 * used elsewhere, so the page makes its argument before the reader scrolls.
 */
export function Hero() {
  const top5 = schools.slice(0, 5);
  const flaggedIds = new Set([
    "ace-higher-secondary-school",
    "vs-niketan-secondary-school",
    "st-marys-school",
    "kathmandu-model-college",
  ]);
  const flaggedPreview = redFlags.filter((r) => flaggedIds.has(r.id));

  return (
    <section className="pt-6 md:pt-10">
      <div className="madison-hero on-dark">
      <div className="animate-[page-settle_420ms_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="grid items-center gap-x-10 gap-y-6 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <span className="type-label text-bronze-ink">Edition {meta.edition}</span>

            <h1
              tabIndex={-1}
              className="type-display measure mt-5 text-ink outline-none"
              style={{ animationDelay: "var(--intro-reveal-delay)" }}
            >
              The worst and the best
              <br />
              of top high schools.
            </h1>

            <p className="type-body measure-snug mt-6 text-ink-muted">
              Highlighting the reality of high schools in Nepal beyond what they advertise.
            </p>
          </div>

          <div className="flex flex-col gap-3 justify-self-start md:justify-self-end">
            <Button asChild size="lg" className="w-full border border-gold bg-gold text-ink hover:bg-bronze-soft sm:w-auto">
              <Link to="/rankings">View the rankings</Link>
            </Button>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
              <Link
                to="/methodology"
                className="type-caption text-bronze-ink underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                Methodology
              </Link>
              <Link
                to="/reports"
                className="type-caption text-bronze-ink underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                Annual report
              </Link>
              <Link
                to="/about"
                className="type-caption text-bronze-ink underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                About us
              </Link>
            </div>
          </div>
        </div>
      </div>

      </div>


      {/* Stats as a ruled row. */}
      <Reveal className="min-w-0" delayMs={60}>
        <div className="mt-8 grid grid-cols-2 gap-0 border-y border-rule-soft md:grid-cols-4">
          <StatCell value={formatCount(totalSchools)} label="schools rated" />
          <StatCell value={formatCountPlus(meta.totalResponses)} label="responses" border />
          <StatCell value={formatCount(redFlags.length)} label="red-flagged" border />
          <StatCell value={formatDate(meta.publicationDate)} label="published" border />
        </div>
      </Reveal>

      {/* Red-flag spotlight + top of the table, side by side. */}
      <div className="grid gap-12 pt-10 md:grid-cols-2 md:gap-16">
        <Reveal className="min-w-0" delayMs={120}>
          <div className="red-flag-panel min-w-0 px-5 py-6 md:px-7">
            <h2 className="type-label text-gold">
              <Link
                to="/rankings?view=redflags"
                className="rounded-sm text-ink-faint underline decoration-1 underline-offset-4 transition-colors duration-[120ms] hover:text-bronze-ink"
              >
                Red flag schools <span aria-hidden="true">→</span>
              </Link>
            </h2>
            <div className="mt-4 grid gap-3">
              {flaggedPreview.map((redFlag) => (
                <Link
                  key={redFlag.id}
                  to={`/red-flag/${redFlag.id}`}
                  className="group flex min-w-0 items-stretch gap-3 rounded-sm border border-ink-inverse/25 bg-claret/35 p-3 transition-colors duration-[120ms] hover:border-gold"
                >
                  <span aria-hidden="true" className="w-1 shrink-0 bg-band-weak" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[0.9375rem] font-bold text-ink-inverse group-hover:underline">
                      {redFlag.name}
                    </p>
                    <p className="type-caption mt-1 line-clamp-2 text-ink-inverse/75">
                      {redFlag.reasons[0] ?? "Published reasons pending."}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="shrink-0 self-center text-gold transition-transform duration-[120ms] group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
            <Link
              to="/rankings?view=redflags"
              className="type-caption mt-4 inline-block text-gold underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              See all {redFlags.length} flagged schools
            </Link>
          </div>
        </Reveal>

        <Reveal className="min-w-0" delayMs={180}>
          <aside className="top-table-panel min-w-0">
            <h2 className="type-heading font-bold">
              <Link
                to="/rankings?view=all"
                className="rounded-sm text-ink-faint underline decoration-1 underline-offset-4 transition-colors duration-[120ms] hover:text-bronze-ink"
              >
                Top of the table <span aria-hidden="true">→</span>
              </Link>
            </h2>
            <ol className="mt-4 flex flex-col">
              {top5.map((school, i) => (
                <li
                  key={school.id}
                  className="border-b border-rule-soft py-3 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      to={`/school/${school.id}`}
                      className="flex min-w-0 items-baseline gap-2 rounded-sm"
                    >
                      <span className="inline-flex size-7 shrink-0 items-center justify-center border border-bronze/50 bg-bronze-wash font-serif text-sm font-bold text-bronze-ink">
                        {school.rank}
                      </span>
                      <span className="truncate font-serif text-[0.9375rem] font-bold text-ink hover:underline">
                        {school.name}
                      </span>
                    </Link>
                    <span className={`type-numeric-sm ${bandColor(school.overallScore)}`}>
                      {school.overallScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 pl-7">
                    <ScoreBar
                      value={school.overallScore}
                      size="sm"
                      delayMs={2160 + i * 60}
                      label={`${school.name}, overall ${school.overallScore.toFixed(1)}`}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}

function StatCell({
  value,
  label,
  border = false,
}: {
  value: string;
  label: string;
  border?: boolean;
}) {
  return (
    <div
      className={
        border
          ? "border-t border-rule-soft px-4 py-5 md:border-l md:border-t-0"
          : "px-4 py-5 md:border-t-0"
      }
    >
      <StatBlock value={value} label={label} />
    </div>
  );
}