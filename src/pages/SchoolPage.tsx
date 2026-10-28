import { useEffect } from "react";
import { useParams } from "react-router";

import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";
import { Rule } from "@/components/site/Rule";
import { SchoolHero } from "@/components/school/SchoolHero";
import { CategoryBreakdown } from "@/components/school/CategoryBreakdown";
import { NeighboursTable } from "@/components/school/NeighboursTable";
import { SchoolNavArrows } from "@/components/school/SchoolNavArrows";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { applySeo, schoolSeo } from "@/lib/seo";
import { getSchool } from "@/lib/data";
import type { School } from "@/lib/types";

/**
 * One school, everything we know about it.
 *
 * Split into two components so hooks stay unconditional: the outer one resolves
 * the id, the inner one owns the effect. A bad `:id` is an ordinary state on
 * this route, not an error case, and an early `return` before `useEffect` is a
 * rules-of-hooks violation.
 *
 * The resolved `School` is passed down rather than re-looked-up, so the SEO
 * effect can depend on real fields instead of an `id` it would have to resolve
 * again — and so there is exactly one place that decides whether this URL is a
 * school or a 404.
 */
export function SchoolPage() {
  const { id } = useParams<{ id: string }>();
  const school = getSchool(id);

  // A bad, missing or non-numeric id renders the 404 **in place**: the URL
  // stays put, so the reader keeps their place and the broken link is visible.
  // A redirect would hide both.
  if (!school) return <NotFoundPage />;

  return <SchoolDetail school={school} />;
}

function SchoolDetail({ school }: { school: School }) {
  // Per-school title and description. 42 pages sharing one generic title would
  // waste the one place a real title matters. See `lib/seo.ts`.
  useEffect(() => applySeo(schoolSeo(school)), [school]);

  return (
    <Container>
      <div className="animate-route-in">
        <SchoolHero school={school} />

        <Rule tone="rule" className="mt-10 md:mt-14" />

        <Reveal className="py-12 md:py-16" delayMs={60}>
          <CategoryBreakdown school={school} />
        </Reveal>

        <Rule />

        <Reveal className="py-12 md:py-16" delayMs={120}>
          <NeighboursTable school={school} />
        </Reveal>

        <Rule className="mb-10" />

        <Reveal delayMs={180}>
          <SchoolNavArrows school={school} />
        </Reveal>
      </div>
    </Container>
  );
}
