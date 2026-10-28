import { useEffect, useState } from "react";

import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { Rule } from "@/components/site/Rule";
import { SectionHeader } from "@/components/data-display/SectionHeader";
import { FaqItem, Datum } from "@/components/site/FaqItem";
import { HowToRead } from "@/components/home/HowToRead";
import { SEO, applySeo } from "@/lib/seo";
import { formatCountPlus, formatDate } from "@/lib/format";
import { meta } from "@/lib/data";

/**
 * The method, in full.
 *
 * This page carries what the home page used to carry: how the score is
 * calculated, and the legend for reading a row. The home page links here
 * rather than repeating it, so the landing page is the pitch and this is the
 * proof.
 *
 * The five steps are the same ones stated on `/about` — stated here as
 * dropdowns rather than an always-open list, so a reader who wants the method
 * can open the one step they doubt, and a reader who does not is not handed a
 * wall of text before the legend.
 */
export function MethodologyPage() {
  useEffect(() => applySeo(SEO.methodology), []);

  const steps = [
    {
      title: "Who answered",
      body: `${formatCountPlus(meta.totalResponses)} students across the ${meta.location}, reached through student networks rather than schools. Each rated the school they or their peers attended.`,
    },
    {
      title: "What was asked",
      body: "Four scored dimensions, each rated out of 100, plus open-text questions on fees, clubs, discipline and what they would recommend.",
    },
    {
      title: "How it is weighted",
      body: "School Environment 30%, Net Benefit 30%, Infrastructure 20%, Net Cost 20%. Complaint is collected but weighted at zero, because no usable complaint data came back.",
    },
    {
      title: "The cost inversion",
      body: "A lower cost burden is better, so the raw cost rating is turned upside down (100 − cost) before it is weighted. Without this, expensive schools would rank higher for being expensive.",
    },
    {
      title: "How a rank is assigned",
      body: "Schools are sorted by overall score, descending, and given consecutive ranks. Ties break on the published order, so the ranking is reproducible rather than dependent on sort internals.",
    },
  ];

  return (
    <Container>
      <div className="animate-route-in">
        <header className="pt-12 md:pt-20">
          <Reveal staggerMs={60}>
            <h1 tabIndex={-1} className="type-title measure-tight text-ink outline-none">
              Methodology
            </h1>
            <p className="type-body-lg measure mt-6 text-ink-muted">
              Every score on this site can be traced back to a survey response and a
              published weight. Here is exactly how.
            </p>
          </Reveal>
        </header>

        <Rule tone="rule" className="mt-10" />

        <Reveal className="py-16 md:py-24" delayMs={60}>
          <section className="defer-paint">
            <SectionHeader eyebrow="Method" title="How the score is calculated" />

            <ol className="mt-10 flex flex-col">
              {steps.map((step, i) => (
                <MethodStep key={step.title} n={i + 1} step={step} />
              ))}
            </ol>
          </section>

          <Rule className="mt-16 md:mt-24" />

          {/* FAQ — what the score means, and where the number came from.
              Both start closed, so the method never opens as a wall of text. */}
          <section className="mt-16 md:mt-24">
            <SectionHeader eyebrow="FAQ" />
            <div className="mt-8 flex flex-col gap-3">
              <FaqItem
                question="What does the score mean — and what does it not mean?"
                answer={
                  <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
                    <div className="flex flex-col gap-4">
                      <h3 className="type-label text-band-strong">What it does tell you</h3>
                      <ul className="flex flex-col gap-3">
                        {[
                          "How students at a school actually rate four things that matter.",
                          "Where a school sits relative to others rated on the same questions.",
                          "Which of the four dimensions is carrying a school, and which is holding it back.",
                        ].map((item) => (
                          <li key={item} className="type-body measure-snug text-ink-muted">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                      <h3 className="type-label text-band-weak">What it does not</h3>
                      <ul className="flex flex-col gap-3">
                        {[
                          "It is not an accreditation, and no school body has approved it.",
                          "It is self-reported, so it reflects who felt able to answer and how they felt on the day.",
                          "A single score hides tradeoffs. A school strong on benefit and weak on cost is a real school, not a bug.",
                          "It is not a fit score for your child. That depends on what they need and what you can afford.",
                        ].map((item) => (
                          <li key={item} className="type-body measure-snug text-ink-muted">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                }
              />
              <FaqItem
                question="Where we got the numbers from"
                answer={
                  <dl className="flex flex-col gap-3">
                    <Datum term="Published" value={formatDate(meta.publicationDate)} iso={meta.publicationDate} />
                    <Datum term="Source" value={meta.source} />
                    <Datum term="Scope" value="Kathmandu Valley: +2/ A levels/ IB schools" />
                    <Datum term="Responses" value={formatCountPlus(meta.totalResponses)} />
                  </dl>
                }
              />
            </div>
          </section>
        </Reveal>

        <Rule tone="rule" />

        <Reveal className="py-16 md:py-24" delayMs={120}>
          <HowToRead />
        </Reveal>
      </div>
    </Container>
  );
}

/**
 * One collapsible step: a `<button>` heading with the body in a region hidden
 * until it is opened. `aria-expanded` on the button and `aria-hidden` on the
 * body keep the state announced; the chevron is decorative.
 *
 * All steps start closed, so the page does not open with a wall of caveats.
 */
function MethodStep({
  n,
  step,
}: {
  n: number;
  step: { title: string; body: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-b border-rule-soft last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-baseline gap-4 rounded-sm py-4 text-left transition-colors duration-[120ms] hover:bg-bronze-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
      >
        <span className="font-serif type-numeric leading-none text-bronze-ink">
          {String(n).padStart(2, "0")}
        </span>
        <span className="type-heading flex-1 text-ink">{step.title}</span>
        <span
          aria-hidden="true"
          className={`type-caption shrink-0 text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      <div
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-brand ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="type-body measure-snug pb-4 pl-9 text-ink-muted">{step.body}</p>
        </div>
      </div>
    </li>
  );
}
