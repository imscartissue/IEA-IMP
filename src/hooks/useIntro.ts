import { useCallback, useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The 2-second contributor intro.
 *
 * THE TIMELINE (gzipped — see docs/05-PAGES.md § Intro)
 *
 *   t=0      overlay fades in                              300ms
 *   t=200    "IEA" letters rise, tracking in, 60ms stagger  600ms
 *   t=700    bronze rule scales x from the centre           500ms
 *   t=1200   a single bronze dot fades in                   400ms
 *   t=1250   contributor monograms, 40ms stagger, cap 8     500ms
 *   t=2000   HOLD ENDS. Clip-path wipe up + strip rises     400ms
 *   t=2080   the page underneath settles, 40ms stagger      420ms
 *   t=2400   overlay unmounts
 *
 * 2000ms is the visible hold; 2400ms is total.
 *
 * WHY A STATE MACHINE AND NOT PURE CSS
 * Three things CSS cannot do on its own: unmount the overlay so it stops
 * costing anything, wait for the user to dismiss it, and skip entirely under
 * reduced motion. Everything inside a phase is CSS, so the animations run on
 * the compositor and cost no main-thread time.
 *
 * WHY NOTHING CALLS setState SYNCHRONOUSLY IN AN EFFECT
 * `useReducedMotion` is a media query, and reading it settles one tick after
 * mount. Setting state to "done" from an effect when it flips would cause a
 * cascading render. Instead `phase` is DERIVED at render: reduced motion
 * forces it to "done" with no state change at all, and the effect body only ever
 * schedules timers. That satisfies `react-hooks/set-state-in-effect` for the
 * right reason rather than by suppression.
 *
 * WHY THE PAGE IS MOUNTED UNDERNEATH, NOT INSIDE THE OVERLAY
 * `IntroGate` renders `children` always and the overlay as a sibling, so the
 * page is live from the first frame. A throttled or crashed timer can then only
 * leave an invisible overlay over a working site, never a broken one.
 */

/** Only a `?skipIntro=1` in the URL suppresses it. Dev and screenshot use. */
const SKIP_PARAM = "skipIntro";

export const INTRO = {
  /** Overlay begins fading in. */
  start: 0,
  /** Wordmark letters start. */
  letters: 200,
  /** The rule starts drawing. */
  rule: 700,
  /** The dot appears; the contributor strip follows shortly after. */
  dot: 1200,
  /** Hold ends; the wipe begins. */
  hold: 2000,
  /** Exit animation ends; the overlay unmounts. */
  total: 2400,
} as const;

export type IntroPhase = "idle" | "monogram" | "contributors" | "exiting" | "done";

function skipRequested(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(SKIP_PARAM) === "1";
}

/**
 * @param enabled Whether the splash should play at all. `IntroGate` passes
 *   `pathname === "/"`, so it appears on the landing route and nowhere else.
 *
 * THERE IS NO SESSION FLAG. It played once per tab and was removed: the splash
 * credits the people who built the site, and a reader who reloads the home page
 * should see it again. Suppressing it meant most people never saw it at all,
 * which defeats the point of a credit sequence.
 */
export function useIntro(enabled: boolean) {
  const reduced = useReducedMotion();

  // The one-shot signals are read in a lazy initialiser. This is a client-only
  // SPA with no SSR, so `window` is available, and doing it here rather than in
  // an effect avoids a second render entirely.
  const [phase, setPhase] = useState<IntroPhase>(() =>
    skipRequested() ? "done" : "idle",
  );

  const timers = useRef<number[]>([]);
  const hasRun = useRef(false);

  /**
   * Reduced motion wins over everything, at any point. Deriving it here means
   * toggling the OS setting mid-splash removes the overlay immediately and
   * cleanly, with no state transition and no partially-played animation left
   * behind.
   */
  const effective: IntroPhase = reduced || !enabled ? "done" : phase;

  /** Jump to the exit, or straight to done if already leaving. */
  const dismiss = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase((current) => (current === "exiting" || current === "done" ? current : "exiting"));
  }, []);

  useEffect(() => {
    if (hasRun.current || !enabled || reduced || phase === "done") return;
    hasRun.current = true;

    const at = (ms: number, next: IntroPhase) => {
      timers.current.push(window.setTimeout(() => setPhase(next), ms));
    };

    at(INTRO.start, "monogram");
    at(1200, "contributors");
    at(INTRO.hold, "exiting");
    at(INTRO.total, "done");

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [enabled, reduced, phase]);

  // Any interaction dismisses. `once` because the first one is all that
  // matters; `passive` because we never call preventDefault. A reader who is
  // already reaching for something should not be made to wait two seconds.
  useEffect(() => {
    if (effective === "done" || effective === "exiting") return;
    const opts = { passive: true, once: true } as const;
    const onDismiss = () => dismiss();
    window.addEventListener("pointerdown", onDismiss, opts);
    window.addEventListener("keydown", onDismiss, opts);
    return () => {
      window.removeEventListener("pointerdown", onDismiss);
      window.removeEventListener("keydown", onDismiss);
    };
  }, [effective, dismiss]);

  return {
    phase: effective,
    /** False only once the overlay is fully unmounted. */
    visible: effective !== "done",
    dismiss,
  };
}
