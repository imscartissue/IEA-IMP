import { useEffect } from "react";

import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { Rule } from "@/components/site/Rule";
import { SEO, applySeo } from "@/lib/seo";

/**
 * The annual report.
 *
 * A placeholder until the first report is published. It says the research is
 * underway rather than pretending the document exists — a button to a PDF that
 * is not there yet would be a dead end, and a dead end on a page whose only job
 * is to deliver a document is the whole page failing.
 */
export function AnnualReportPage() {
  useEffect(() => applySeo(SEO.annualReport), []);

  return (
    <Container>
      <div className="animate-route-in">
        <header className="pt-12 md:pt-20">
          <Reveal staggerMs={60}>
            <span className="type-label text-bronze-ink">2026</span>
            <h1 tabIndex={-1} className="type-title measure-tight mt-5 text-ink outline-none">
              Annual report
            </h1>
          </Reveal>
        </header>

        <Rule tone="rule" className="mt-10" />

        <Reveal className="py-16 md:py-24" delayMs={60}>
          <p className="type-body-lg measure text-ink-muted">
            Investigation is underway. The report will be completed once the
            investigations are over.
          </p>
        </Reveal>
      </div>
    </Container>
  );
}
