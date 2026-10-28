import { useEffect, type ReactNode } from "react";
import { Link, useParams } from "react-router";

import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { Rule } from "@/components/site/Rule";
import { SectionHeader } from "@/components/data-display/SectionHeader";
import { Monogram } from "@/components/data-display/Monogram";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { applySeo, redFlagSeo } from "@/lib/seo";
import { getRedFlag, schools } from "@/lib/data";
import { meta } from "@/lib/data";
import type { RedFlag, School } from "@/lib/types";

/**
 * One flagged school and the reasons for it.
 */
export function RedFlagPage() {
  const { id } = useParams<{ id: string }>();
  const redFlag = getRedFlag(id);

  if (!redFlag) return <NotFoundPage />;

  return <RedFlagDetail redFlag={redFlag} />;
}

function RedFlagDetail({ redFlag }: { redFlag: RedFlag }) {
  useEffect(() => {
    applySeo(redFlagSeo(redFlag));
  }, [redFlag]);

  // Some flagged schools are also in the ranked roster. Match by name (the
  // red-flag name may be a short form of the ranked name).
  const matchedSchool: School | undefined = schools.find((s) => {
    const a = s.name.toLowerCase();
    const b = redFlag.name.toLowerCase();
    return a === b || a.startsWith(b) || b.startsWith(a);
  });

  return (
    <>
      {/* Warning banner — the only red surface on the page. */}
      <div className="red-flag-alert">
        <Container>
          <div className="flex items-center gap-3 py-3 md:py-4">
            <span
              aria-hidden="true"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm border border-ink-inverse/40 font-serif text-xs font-bold"
            >
              !
            </span>
            <p className="type-label text-ink-inverse">
              Red flag — this school has been flagged by IEA
            </p>
          </div>
        </Container>
      </div>

      {/* Red left rail down the whole content area. */}
      <div className="red-flag-page border-l-2 border-claret">
        <Container>
          <div className="red-flag-detail-hero animate-route-in">
            <nav aria-label="Breadcrumb" className="type-caption text-ink-inverse/75">
              <Link
                to="/rankings?view=redflags"
                className="text-gold underline underline-offset-4 hover:decoration-2"
              >
                Red flag schools
              </Link>
              <span aria-hidden="true" className="mx-2">/</span>
              <span aria-current="page">{redFlag.name}</span>
            </nav>

            <div className="relative mt-8 flex items-center gap-4 md:mt-10">
              <Monogram name={redFlag.name} size="lg" />
              <span className="type-label text-gold">Red flag school</span>

              {/* Rotated stamp. */}
              <span
                aria-hidden="true"
                className="absolute right-0 top-0 hidden -rotate-6 select-none border-2 border-gold/70 px-3 py-1 font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold md:inline-block"
              >
                Flagged
              </span>
            </div>

            <h1
              tabIndex={-1}
              className="type-display measure-tight mt-6 text-ink-inverse outline-none"
            >
              {redFlag.name}
            </h1>

            <p className="type-caption mt-4 text-ink-inverse/70">
              Published by IEA · {meta.publicationDate.slice(0, 4)} · Reasons:{" "}
              {redFlag.reasons.length} · Status: Flagged
            </p>

            <div className="red-flag-case-summary mt-7 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.65fr)] md:items-end">
              <p className="type-heading max-w-[40rem] text-ink-inverse">
                IEA has flagged this school. The reasons are published below.
              </p>
              <aside className="red-flag-summary-card" aria-label="Notice summary">
                <p className="type-label text-gold">Notice summary</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="type-caption text-ink-inverse/65">Reasons published</p>
                    <p className="mt-1 font-serif type-numeric text-ink-inverse">{redFlag.reasons.length}</p>
                  </div>
                  <div>
                    <p className="type-caption text-ink-inverse/65">{matchedSchool ? "Ranking position" : "Ranking status"}</p>
                    <p className="mt-1 font-serif type-numeric-sm text-ink-inverse">
                      {matchedSchool ? `#${matchedSchool.rank}` : "Separate notice"}
                    </p>
                  </div>
                </div>
                {matchedSchool ? (
                  <Link
                    to={`/school/${matchedSchool.id}`}
                    className="mt-4 inline-block type-caption text-gold underline underline-offset-4 hover:decoration-2"
                  >
                    Explore the full school profile →
                  </Link>
                ) : (
                  <p className="mt-4 type-caption text-ink-inverse/70">
                    This notice is maintained separately from the ranked school table.
                  </p>
                )}
              </aside>
            </div>
          </div>

          <Rule tone="rule" className="mt-12 md:mt-16" />

          <Reveal className="py-2 md:py-4" delayMs={60}>
            <SectionHeader
              eyebrow="The reasons"
              title="Why this school is flagged"
              className="mb-8 md:mb-10 [&_.type-label]:text-band-weak"
            />
          </Reveal>

          {redFlag.reasons.length === 0 ? (
            <p className="type-body-lg measure text-ink-muted">
              No specific reasons have been published for this school yet.
            </p>
          ) : (
            <ol className="red-flag-reason-list flex flex-col">
              {redFlag.reasons.map((reason, i) => (
                <li
                  key={reason}
                  className="grid gap-x-6 gap-y-2 border-b border-claret/20 py-6 last:border-b-0 md:grid-cols-[3.5rem_minmax(0,1fr)]"
                >
                  <span
                    aria-hidden="true"
                    className="font-serif type-numeric leading-none text-claret"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="type-body-lg measure-snug font-bold text-ink">
                    {reason}
                  </p>
                </li>
              ))}
            </ol>
          )}

          {/* Source well. */}
          <Reveal className="mt-12 md:mt-16" delayMs={120}>
            <div className="border-l-2 border-band-weak bg-sunken px-6 py-6 md:px-8">
              <p className="type-label text-band-weak">About this flag</p>
              <p className="type-body-lg measure mt-3 text-ink-muted">
                These highlights record student-reported concerns submitted to IEA. They are
                published for public awareness and accountability. They are not necessarily
                independently verified, and publication does not imply that IEA originated the
                underlying allegations.
              </p>
              <p className="type-body-lg measure mt-6 text-ink-muted">
                If you have any queries, please contact us at{" "}
                <a
                  href="mailto:info@ieainstitute.org"
                  className="text-bronze-ink underline underline-offset-4 hover:decoration-2"
                >
                  info@ieainstitute.org
                </a>
                .
              </p>
            </div>
          </Reveal>

          <Rule tone="rule" className="mt-16 md:mt-20" />

          {/* Closing card. */}
          <Reveal className="py-12 md:py-16" delayMs={180}>
            <div className="border-t-2 border-band-weak bg-sunken px-6 py-8 md:px-8">
              <div className="flex flex-wrap gap-4">
                <ButtonLink to="/rankings?view=redflags">
                  See all flagged schools →
                </ButtonLink>
                <ButtonLink to="/">Back to the home page</ButtonLink>
              </div>
              <p className="type-caption mt-6 text-ink-faint">
                Have information about this school?{" "}
                <a
                  href="mailto:info@ieainstitute.org"
                  className="text-bronze-ink underline underline-offset-4 hover:decoration-2"
                >
                  Contact IEA
                </a>
                .
              </p>
            </div>
          </Reveal>
        </Container>
      </div>
    </>
  );
}

function ButtonLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="type-ui font-bold text-bronze-ink underline underline-offset-4 hover:decoration-2"
    >
      {children}
    </Link>
  );
}