import { useEffect, useRef, useState } from "react";

/**
 * Reveal an element once it scrolls into view — or immediately if it is
 * already in the viewport on mount, so text on first paint never stays hidden.
 *
 * While the intro splash is on screen (`html.intro-active`), nothing reveals:
 * the page is mounted underneath the overlay, so elements that are
 * geometrically in the viewport would otherwise animate behind the splash and
 * be already visible by the time the splash ends. We wait for `intro-active`
 * to be removed before checking visibility.
 *
 * Deliberately a class toggle, not an animation library: a single
 * IntersectionObserver flips a boolean, and CSS transitions do the rest. That
 * keeps the reveal dependency-free, runs on the compositor, and is collapsed to
 * instant by the global `prefers-reduced-motion` rule.
 *
 * The observer disconnects after the first reveal, so a section that has been
 * seen never re-observes it. Elements are revealed once, not on every pass.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver: show the content rather than leaving it hidden.
    if (typeof IntersectionObserver === "undefined") {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    // While the intro splash is on screen, hold everything back. The page is
    // mounted underneath the overlay, so elements in the viewport would reveal
    // behind the splash and be invisible-animated by the time the splash ends.
    if (document.documentElement.classList.contains("intro-active")) {
      const onIntroEnd = () => {
        const rect = el.getBoundingClientRect();
        const inViewport =
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0;
        if (inViewport) {
          setVisible(true);
          cleanup();
        }
      };

      const cleanup = () => {
        observer.disconnect();
        rootObserver.disconnect();
      };

      const root = document.documentElement;
      const rootObserver = new MutationObserver(() => {
        if (!root.classList.contains("intro-active")) {
          onIntroEnd();
        }
      });
      rootObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            setVisible(true);
            cleanup();
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
      );

      observer.observe(el);
      return cleanup;
    }

    // If already in the viewport right now, reveal immediately — don't wait
    // for the next observation tick. This is what makes text animate on first
    // load instead of only after a scroll.
    const rect = el.getBoundingClientRect();
    const alreadyVisible =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;
    if (alreadyVisible) {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
