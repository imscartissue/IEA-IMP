import { useCallback, useSyncExternalStore } from "react";

/**
 * True once the page has scrolled past `threshold`.
 *
 * Used by the masthead to swap from a transparent resting state to a solid fill
 * with a bottom hairline.
 *
 * Returns a **boolean**, not a scroll offset, on purpose: the header only cares
 * which side of the threshold it is on, so the component re-renders exactly once
 * on the way past and not on every scroll frame.
 *
 * The `requestAnimationFrame` inside `subscribe` is not optional. Reading
 * `scrollY` in the event handler and letting React re-render synchronously on
 * every scroll event is the classic way to cause layout thrash; batching to one
 * read per frame is the fix.
 */
export function useScrollShadow(threshold = 8): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      let frame = 0;

      const schedule = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          onStoreChange();
        });
      };

      // Covers the case where the page loads already scrolled (the browser may
      // restore scroll position on reload) and no scroll event ever fires.
      schedule();
      window.addEventListener("scroll", schedule, { passive: true });
      return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
      };
    },
    [],
  );

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
