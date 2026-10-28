import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query.
 *
 * Built on `useSyncExternalStore` rather than the usual
 * `useState` + `useEffect` + `addEventListener` shape, for two reasons:
 *
 * 1. The naive version calls `setState` synchronously inside the effect body,
 *    which causes an extra cascading render on every mount and every query
 *    change. `useSyncExternalStore` reads the value during render instead.
 * 2. It is tear-free. A media query can flip between render and commit; this
 *    hook cannot hand you a stale value.
 *
 * The server snapshot is `false` (assume "not reduced motion"). Components must
 * be written so their first frame is correct without this — render the resting
 * state and animate away from it, rather than flashing and then animating in.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  // `matchMedia().matches` is a boolean primitive, so `Object.is` comparison
  // keeps the snapshot stable between calls.
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Convenience wrapper for the project's mobile breakpoint. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 47.999rem)");
}
