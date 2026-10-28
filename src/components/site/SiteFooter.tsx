import { Link } from "react-router";

import { Container } from "@/components/site/Container";
import { Rule } from "@/components/site/Rule";
import { formatCount, formatCountPlus, formatDate } from "@/lib/format";
import { meta, totalSchools } from "@/lib/data";

/**
 * Full-bleed ink footer. The one place the site goes dark on purpose — it
 * closes the page like the colophon of a printed volume, and it makes the
 * provenance ("where did this number come from?") impossible to miss.
 */
export function SiteFooter() {
  return (
    <footer className="madison-foot mt-16 border-t-4 border-double border-gold bg-ink text-ink-inverse md:mt-24">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-[2fr_1fr_1fr] md:gap-12 md:py-16">
          <div>
            <img
              src="/brand/stacked-dark.webp"
              alt="The Institute for Educational Accountability: Evidence, Transparency, Accountability"
              width={900}
              height={381}
              loading="lazy"
              decoding="async"
              className="h-auto w-64 max-w-full"
            />
            <p className="type-body mt-5 measure-snug text-ink-inverse/70">
              An independent examination of Nepali schools, grounded in verified student
              testimony, field inquiry, and credible public sources, undertaken to illuminate
              the institutions entrusted with educating the next generation.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="type-label text-ink-inverse/50">Pages</h2>
            <ul className="mt-4 space-y-2">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/rankings">Ranking</FooterLink>
              <FooterLink to="/about">About</FooterLink>
            </ul>
          </nav>

          <div>
            <h2 className="type-label text-ink-inverse/50">Data</h2>
            <dl className="mt-4 space-y-2">
              <Datum term="Schools" value={formatCount(totalSchools)} />
              <Datum term="Responses" value={formatCountPlus(meta.totalResponses)} />
              <Datum term="Published" value={formatDate(meta.publicationDate)} />
            </dl>
          </div>
        </div>

        <Rule className="bg-ink-inverse/15" />

        <p className="type-caption measure pt-6 text-gold">
          &ldquo;If men were angels, no government would be necessary.&rdquo; James Madison,
          Federalist No. 51
        </p>

      </Container>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="type-ui text-ink-inverse/80 underline decoration-1 underline-offset-4 transition-colors hover:text-ink-inverse hover:decoration-bronze"
      >
        {children}
      </Link>
    </li>
  );
}

function Datum({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="type-caption text-ink-inverse/50">{term}</dt>
      <dd className="type-numeric-sm text-ink-inverse/80">{value}</dd>
    </div>
  );
}
