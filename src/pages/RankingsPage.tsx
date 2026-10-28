import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";

import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { Rule } from "@/components/site/Rule";
import { RankingsTable } from "@/components/rankings/RankingsTable";
import { RankingsToolbar } from "@/components/rankings/RankingsToolbar";
import { SchoolListRow } from "@/components/rankings/SchoolListRow";
import { EmptyState } from "@/components/rankings/EmptyState";
import { RedFlagList } from "@/components/red-flags/RedFlagList";
import { useRankings } from "@/hooks/useRankings";
import { meta } from "@/lib/data";
import { SEO, applySeo } from "@/lib/seo";
import { formatCountPlus, formatDate } from "@/lib/format";

/**
 * The full ranking. The most important page in the product.
 *
 * Sorting, searching and filtering all live in the URL, so any view of this
 * table is shareable, bookmarkable, and survives a refresh.
 */
export function RankingsPage() {
  useEffect(() => applySeo(SEO.rankings), []);

  const state = useRankings();
  const navigate = useNavigate();
  const onNavigate = useCallback((id: number) => void navigate(`/school/${id}`), [navigate]);

  const { rows, filters, sort, columns, view, setSort, setView, toggleColumn, reset, shown, total, isFiltered } = state;

  return (
    <Container>
      <div className="animate-route-in">
        <header className="pt-12 md:pt-20">
          <Reveal staggerMs={60}>
            <h1 tabIndex={-1} className="type-title text-ink outline-none">
              {view === "redflags" ? "Red flag schools" : "Rankings"}
            </h1>

            <dl className="type-caption mt-6 flex flex-wrap gap-x-8 gap-y-1 text-ink-faint">
              <div className="flex gap-2">
                <dt>Published</dt>
                <dd className="text-ink-muted">
                  <time dateTime={meta.publicationDate}>{formatDate(meta.publicationDate)}</time>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt>Responses</dt>
                <dd className="text-ink-muted">{formatCountPlus(meta.totalResponses)}</dd>
              </div>
              <div className="flex gap-2">
                <dt>Source</dt>
                <dd className="text-ink-muted">{meta.source}</dd>
              </div>
            </dl>
          </Reveal>
        </header>

        <Rule tone="rule" className="mt-8 md:mt-10" />

        <Reveal className="py-8 md:py-10" delayMs={60}>
          <RankingsToolbar
            filters={filters}
            sort={sort}
            columns={columns}
            view={view}
            shown={shown}
            total={total}
            isFiltered={isFiltered}
            onQuery={state.setQuery}
            onType={state.setType}
            onBand={state.setBand}
            onSort={setSort}
            onView={setView}
            onToggleColumn={toggleColumn}
            onReset={reset}
          />
        </Reveal>

        <Rule />

        <Reveal delayMs={120}>
          {view === "redflags" ? (
            /* The curated red-flag list. No rank, no score, shuffled on load —
               see RedFlagList for why it is not a filtered table. */
            <RedFlagList />
          ) : rows.length === 0 ? (
            <EmptyState query={filters.q || undefined} onReset={reset} />
          ) : (
            <>
              {/* Desktop: the real table. Shown only on large screens so the
                  eight columns never force a horizontal scroll on a tablet. */}
              <div className="hidden lg:block">
                <RankingsTable
                  rows={rows}
                  columns={columns}
                  sort={sort}
                  onSort={setSort}
                  onNavigate={onNavigate}
                />
              </div>

              {/* Stacked list below `lg`: a 9-column table on a narrow screen
                  is unusable, so the metrics move into a compact grid. */}
              <ul className="lg:hidden">
                {rows.map((school) => (
                  <SchoolListRow key={school.id} school={school} />
                ))}
              </ul>

              <p className="type-caption measure mt-10 border-t border-rule-soft pt-6 text-ink-faint">
                Net Cost is inverted: a school that costs less to attend scores higher, so the
                column reads like every other one. Overall score is a weighted blend of School
                Environment (30%), Net Benefit (30%), Infrastructure (20%) and Net Cost (20%).
              </p>
            </>
          )}
        </Reveal>
      </div>
    </Container>
  );
}
