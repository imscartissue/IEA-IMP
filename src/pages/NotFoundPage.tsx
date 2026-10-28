import { useEffect } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { SEO, applySeo } from "@/lib/seo";

/**
 * Styled 404. Never a bare status page — a reader who lands here should get
 * navigation out of it in one tap.
 *
 * Also rendered in place by `SchoolPage` for an unknown `:id`, so it must not
 * assume it is the whole page.
 */
export function NotFoundPage() {
  useEffect(() => applySeo(SEO.notFound), []);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center">
      <div aria-hidden="true" className="h-0.5 w-7 bg-bronze" />
      <h1 tabIndex={-1} className="type-title mt-6 text-ink outline-none">Page not found</h1>
      <p className="type-body measure mt-4 text-ink-muted">
        That ranking doesn&rsquo;t exist. It may have been renamed, or the link may be wrong.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/rankings">See the rankings</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
