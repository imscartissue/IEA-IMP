import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Whether the user has asked for reduced motion.
 *
 * Two independent mechanisms cover this, deliberately:
 *
 * 1. `src/styles/index.css` sets `transition-duration: 0.01ms` globally under a
 *    `prefers-reduced-motion` media query, and the app root is wrapped in
 *    `<MotionConfig reducedMotion="user">` so the motion library respects it
 *    too. That handles CSS transitions and library animations.
 *
 * 2. This hook exists for what CSS cannot express — *skipping* an animation
 *    rather than making it instant, and not rendering a subtree at all. The
 *    2-second intro, for example, must disappear completely, not flash past.
 *
 * Because of (1), components should render their resting state first and animate
 * away from it, so the first frame is already correct.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
