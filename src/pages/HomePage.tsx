import { useEffect } from "react";

import { Container } from "@/components/site/Container";
import { Hero } from "@/components/home/Hero";
import { SEO, applySeo } from "@/lib/seo";

/**
 * The landing page.
 *
 * Hero carries the stats, red-flag spotlight and top of the table. The data band
 * breaks out to full width as the single high-contrast anchor.
 */
export function HomePage() {
  useEffect(() => applySeo(SEO.home), []);

  return (
    <>
      <Container>
        <Hero />
      </Container>
    </>
  );
}