import { useEffect, useState } from "react";
import { Link } from "react-router";

import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { Rule, AccentRule } from "@/components/site/Rule";
import { StatBlock, StatRow } from "@/components/data-display/StatBlock";
import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/site/TeamCard";
import { MessageModal } from "@/components/site/MessageModal";
import { founderMessage, presidentMessage } from "@/data/messages";
import { contributors } from "@/data/contributors";
import { SEO, applySeo } from "@/lib/seo";
import { bandCounts, meanResponses, meta, totalSchools } from "@/lib/data";
import { formatCount, formatCountPlus, formatDate } from "@/lib/format";

/**
 * The institute, the numbers, the people.
 *
 * On the live site this page is literally "Information Unavailable". It exists
 * because a ranking is a statistical claim about named institutions, and the
 * reader is entitled to know who made it, how, and how much to trust it. The
 * how — and the FAQ about what the score means — live on `/methodology`.
 */
export function AboutPage() {
  /** Map member name → photo path, so each TeamCard can show the portrait. */
  const photoByName = new Map(
    contributors.map((c) => [c.name, c.photo ?? undefined]),
  );
  useEffect(() => applySeo(SEO.about), []);

  /** Which founder letter is open: null, "president", or "founder". */
  const [letter, setLetter] = useState<"president" | "founder" | null>(null);

  return (
    <Container>
      <div className="animate-route-in">
        <header className="pt-12 md:pt-20">
          <Reveal staggerMs={60}>
            <div className="flex items-center gap-3">
              <AccentRule />
              <span className="type-label text-bronze-ink">The institute</span>
            </div>

            <h1
              tabIndex={-1}
              className="type-title measure-tight mt-5 text-ink outline-none"
            >
              About Us
            </h1>

            <div className="mt-8 flex flex-col gap-6">
              <p className="type-body-lg measure text-ink-muted">
                The{" "}
                <strong className="font-bold text-ink">
                  Institute for Educational Accountability (IEA)
                </strong>{" "}
                advances transparency and accountability in education through
                field research, school investigations, online research, student
                surveys, and evidence-based analysis.
              </p>
              <p className="type-body-lg measure text-ink-muted">
                We seek to highlight institutional shortcomings, not manufacture
                accusations. Our claims are grounded in evidence, and our
                conclusions remain proportionate to what that evidence
                establishes.
              </p>
              <p className="type-body-lg measure text-ink-muted">
                Where necessary, we pursue appropriate institutional and legal
                avenues to seek meaningful change.
              </p>
            </div>

            {/* The principle, set as a pull quote: same type size, but ruled
                and tinted so it reads as the sentence the page stands on. */}
            <blockquote className="mt-10 max-w-[46rem] border-l-[3px] border-bronze bg-bronze-soft/30 py-6 pr-6 pl-6 md:pl-8">
              <p className="type-body-lg text-ink">
                Guided by the principle that power must be accompanied by
                accountability, we strive to ensure that educational institutions
                remain answerable to the students they serve, while holding our
                own work to the same standards of fairness, evidence, and
                transparency.
              </p>
            </blockquote>
          </Reveal>
        </header>

        <Rule tone="rule" className="mt-10" />

        {/* --- the project in numbers ------------------------------------- */}
        <Reveal className="py-12 md:py-16" delayMs={60}>
          <StatRow>
            <StatBlock
              value={formatCount(totalSchools)}
              label="schools rated"
              sublabel={`${formatDate(meta.publicationDate)}`}
            />
            <StatBlock
              value={formatCountPlus(meta.totalResponses)}
              label="students answered"
              sublabel={`mean ${meanResponses} per school`}
            />
            <StatBlock
              value={formatCount(bandCounts.strong)}
              label="rated strong"
              sublabel={`${bandCounts.fair} fair, ${bandCounts.weak} weak`}
            />
          </StatRow>

          <p className="type-body measure mt-8 text-ink-muted">
            All data was collected from anonymous surveys.
          </p>
        </Reveal>

        <Rule />

        {/* --- people ------------------------------------------------------ */}
        <Reveal className="py-8 md:py-20" delayMs={180}>
          <div className="text-center mb-20 md:mb-28">
            <p className="type-label text-bronze-ink uppercase tracking-[0.25em] mb-4">The people</p>
            <h2 className="type-title text-ink mb-6 bg-clip-text text-transparent bg-gradient-to-r from-ink via-bronze to-ink">
              The team
            </h2>
          </div>

          {/* Founders */}
          <section className="relative mb-14 md:mb-20">
            <div className="absolute inset-0 -z-10 bg-bronze-soft/40 rounded-2xl blur-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="flex flex-col items-center gap-5">
                <TeamCard
                  name="Yogeshwor Sharma"
                  role="Founder, President, & Head of Operations"
                  featured
                  photo={photoByName.get("Yogeshwor Sharma")}
                />
                <Button
                  onClick={() => setLetter("president")}
                  className="bg-letter text-ink-inverse hover:bg-letter-deep active:bg-letter-deep"
                >
                  Message from president
                </Button>
              </div>
              <div className="flex flex-col items-center gap-5">
                <TeamCard
                  name="Eron Subedi"
                  role="Founder, Chief Architect & Chief of Investigations"
                  featured
                  photo={photoByName.get("Eron Subedi")}
                />
                <Button
                  onClick={() => setLetter("founder")}
                  className="bg-letter text-ink-inverse hover:bg-letter-deep active:bg-letter-deep"
                >
                  Message from founder
                </Button>
              </div>
            </div>
          </section>

          {/* Leadership — Aarohan, Tikaram, Prajjwal */}
          <section className="mb-14 md:mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 items-start justify-items-center">
              <TeamCard name="Aarohan Baral" role="Lead Developer" photo={photoByName.get("Aarohan Baral")} />
              <TeamCard name="Tikaram Sharma" role="Co-Founder & Statistical Analyst" photo={photoByName.get("Tikaram Sharma")} />
              <TeamCard name="Prajjwal Dhakal" role="Co-Founder" photo={photoByName.get("Prajjwal Dhakal")} />
            </div>
          </section>

          {/* Research Executive */}
          <section className="mb-14 md:mb-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 justify-items-center">
              <TeamCard name="Abinash Poudel" role="Lead of Online Research" photo={photoByName.get("Abinash Poudel")} />
              <TeamCard name="Nischal Ghimire" role="Research Executive" photo={photoByName.get("Nischal Ghimire")} />
              <TeamCard name="Kaustuv Rimal" role="Research Executive" />
              <TeamCard name="Aaditya Jha" role="Research Executive" photo={photoByName.get("Aaditya Jha")} />
              <TeamCard name="Aishani Rai" role="Editorial Lead" photo={photoByName.get("Aishani Rai")} />
              <TeamCard name="Ashmit Pandey" role="Managing Editor and Associate Researcher" photo={photoByName.get("Ashmit Pandey")} />
            </div>
          </section>

          {/* Research Analyst */}
          <section className="mb-14 md:mb-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 justify-items-center">
              <TeamCard name="Krinjal Timalsina" role="Research Analyst" photo={photoByName.get("Krinjal Timalsina")} />
              <TeamCard name="Aadarsha Pandey" role="Research Analyst" />
              <TeamCard name="Piyush Joshi" role="Research Analyst" photo={photoByName.get("Piyush Joshi")} />
              <TeamCard name="Pratyush Neupane" role="Research Analyst" photo={photoByName.get("Pratyush Neupane")} />
              <TeamCard name="Sambriddhi Bhattarai" role="Research Analyst" photo={photoByName.get("Sambriddhi Bhattarai")} />
              <TeamCard name="Kashyap Shrestha" role="Research Analyst" photo={photoByName.get("Kashyap Shrestha")} />
            </div>
          </section>
        </Reveal>

        <p className="type-body measure mt-6 text-ink-muted">
          We want to show our gratitude to all those who answered the surveys
          honestly and made this possible. Their name and the individual
          responses, however, won't be published anywhere to maintain their
          anonymity.
        </p>

        <Rule />

        {/* --- independence ------------------------------------------------- */}
        <Reveal className="py-12 md:py-16" delayMs={220}>
          <div className="flex items-center gap-3">
            <AccentRule />
            <span className="type-label text-bronze-ink">Institutional independence</span>
          </div>
          <h2 className="type-heading mt-4 text-ink">Who we answer to</h2>
          <ul className="mt-6 max-w-[46rem] border-y border-rule-soft">
            {[
              "The Institute accepts no donations.",
              "The Institute receives no funding from foreign organisations.",
              "Every member of the Institute was born in Nepal.",
            ].map((line) => (
              <li
                key={line}
                className="type-body-lg border-b border-rule-soft py-4 text-ink last:border-b-0"
              >
                {line}
              </li>
            ))}
          </ul>
        </Reveal>

        <Rule />

        {/* --- contact and disclosure -------------------------------------- */}
        <Reveal className="py-8 md:py-10" delayMs={240}>
          <div className="max-w-[46rem] border-l-2 border-claret/70 pl-4 md:pl-6">
            <p className="type-label text-bronze-ink">Contact and disclosure policy</p>
            <p className="type-caption measure mt-3 text-ink-faint">
              If a school contacts the Institute about its ranking, Institute policy mandates
              the release of all materials underlying that ranking, whether the assessment is
              favourable or adverse.
            </p>
          </div>
        </Reveal>

        <Rule />

        {/* --- provenance --------------------------------------------------- */}
        <Reveal className="py-12 md:py-16" delayMs={260}>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Button asChild variant="outline">
              <Link to="/rankings">See the rankings</Link>
            </Button>
            <Button asChild variant="link">
              <Link to="/">Back to the home page</Link>
            </Button>
          </div>
        </Reveal>

        {/* --- intellectual foundations ------------------------------------
            Deliberately last and small: context for those who read this far,
            not a headline. */}
        <Rule />
        <section className="py-10 md:py-12">
          <span className="type-label text-ink-faint">Intellectual foundations</span>
          <h2 className="type-subheading mt-3 font-bold text-ink-muted">The Madisonian tradition</h2>
          <div className="mt-4 flex flex-col gap-3">
            <p className="type-caption measure text-ink-faint">
              The founder holds that the ideas of James Madison remain central to how
              freedom is understood and protected around the world: that power must be
              checked, that those who hold it must answer to the people it affects, and
              that open information is a precondition of self-government. These principles
              inform the Institute&rsquo;s purpose and practice. The founder has stated
              that he would not have undertaken this project without them, and the
              Institute seeks to conduct its work in that spirit.
            </p>
          </div>
        </section>

        {/* --- institutional legal position -------------------------------- */}
        <Reveal className="py-12 md:py-16" delayMs={300}>
          <section className="institutional-legal-position" aria-labelledby="legal-position-title">
            <span className="legal-position-mark" aria-hidden="true">§</span>
            <div className="legal-position-content">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/35 pb-5">
                <div className="flex items-center gap-3">
                  <span className="accent-mark" />
                  <p className="type-label text-gold">Institutional position · Legal action</p>
                </div>
                <span className="type-caption text-ink-inverse/55">IEA / PUBLIC STATEMENT</span>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(15rem,0.75fr)_minmax(0,1.5fr)] lg:gap-16">
                <div>
                  <p className="type-label text-gold/80">Principle and remedy</p>
                  <h2 id="legal-position-title" className="type-title mt-4 max-w-[18ch] text-ink-inverse">
                    Institutional Position on Individualized Legal Action
                  </h2>
                  <div className="mt-6 h-px w-20 bg-gold" />
                </div>

                <div className="legal-position-copy flex flex-col gap-5">
                  <p className="type-body-lg text-ink-inverse/90">
                    The Institute for Educational Accountability (IEA) generally seeks to address systemic failures in educational accountability rather than single out individual schools. Our work is guided by evidence, institutional reform, and the public interest.
                  </p>
                  <p className="type-body-lg text-ink-inverse/90">
                    However, this approach should not be mistaken for a relinquishment of our legal rights. Where an individual school initiates legal proceedings against IEA, engages in unlawful conduct against the Institute, or otherwise seeks to obstruct its legitimate activities, IEA reserves the right to pursue appropriate individualized legal remedies, including counterclaims and independent legal proceedings where justified by the facts and applicable law.
                  </p>
                  <p className="type-body-lg text-ink-inverse/90">
                    Where relevant and legally permissible, such proceedings may include the presentation of documented evidence and student accounts concerning the school&rsquo;s conduct. Evidence collected through our research may be submitted to the competent judicial authorities when appropriate, subject to applicable evidentiary rules, confidentiality obligations, and the protection of students&rsquo; identities where required.
                  </p>
                  <p className="type-body-lg text-ink-inverse/90">
                    IEA remains committed to the rule of law. Our preference for systemic reform does not preclude pursuing accountability against individual institutions when circumstances warrant it.
                  </p>
                </div>
              </div>

            </div>
          </section>
        </Reveal>

        {/* --- founder letters --------------------------------------------- */}
        <MessageModal
          open={letter === "president"}
          onClose={() => setLetter(null)}
          name="Yogeshwor Sharma"
          role="Message from the President"
          blocks={presidentMessage}
        />
        <MessageModal
          open={letter === "founder"}
          onClose={() => setLetter(null)}
          name="Eron Subedi"
          role="Message from the Founder"
          blocks={founderMessage}
        />
      </div>
    </Container>
  );
}


