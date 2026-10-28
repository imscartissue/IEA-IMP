import { band, BAND_LABEL } from "@/lib/scoring";
import { cn } from "@/lib/utils";

/**
 * The overall score as a 270° arc gauge.
 *
 * Hand-rolled SVG — no chart library. A 40-line component versus 40 kB gzipped
 * is the whole argument; see `01-STACK.md § Rejected`.
 *
 * The arc animates with `stroke-dasharray` on mount, once. That is a paint-only
 * property, not a layout one, so it stays on the compositor. It is skipped
 * entirely under `prefers-reduced-motion` by the global rule in `index.css`.
 *
 * Ticks at the 50 and 75 thresholds are drawn so the band boundaries are
 * visible on the dial itself — a reader should be able to see *where* "fair"
 * ends without consulting a legend.
 */
/** Full class names so Tailwind v4 can see them (no `text-band-${b}`). */
const BAND_TEXT = { strong: "text-band-strong", fair: "text-band-fair", weak: "text-band-weak" } as const;

export function ScoreDial({ value, size = 200, className }: { value: number; size?: number; className?: string }) {
  const b = band(value);
  const clamped = Math.max(0, Math.min(100, value));

  // A 270° arc: 3/4 of the circumference. Starts at 12 o'clock.
  const SWEEP = 270;
  const R = 40; // in viewBox units (viewBox is 100×100)
  const CIRC = 2 * Math.PI * R;
  const arcLength = (SWEEP / 360) * CIRC;

  const tick = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    const inner = R - 5;
    const outer = R + 4;
    return {
      x1: 50 + Math.cos(rad) * inner,
      y1: 50 + Math.sin(rad) * inner,
      x2: 50 + Math.cos(rad) * outer,
      y2: 50 + Math.sin(rad) * outer,
    };
  };

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      // The number is in the DOM as text below, so the SVG is decorative here.
      role="img"
      aria-label={`Overall score ${clamped.toFixed(1)} out of 100, rated ${BAND_LABEL[b].toLowerCase()}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="var(--color-rule-soft)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${CIRC}`}
        />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={`var(--color-band-${b})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${CIRC}`}
          // The parent carries -rotate-90, so a circle starting at 3 o'clock
          // reads as starting at 12 o'clock. No per-value rotation needed.
          className="animate-[dial-sweep_700ms_cubic-bezier(0.16,1,0.3,1)_both]"
          style={
            {
              // `dial-sweep` animates between these two. Both are passed in as
              // custom properties because the target depends on the value.
              "--dial-from": `${arcLength}`,
              "--dial-to": `${arcLength * (1 - clamped / 100)}`,
            } as React.CSSProperties
          }
        />

        {/* Threshold ticks at 50 (fair) and 75 (strong). */}
        {[50, 75].map((deg) => {
          const t = tick(deg);
          return (
            <line
              key={deg}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="var(--color-canvas)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      <div className="relative z-10 flex flex-col items-center">
        <span className={cn("type-numeric-lg leading-none", BAND_TEXT[b])}>
          {clamped.toFixed(1)}
        </span>
        <span className="type-label mt-1.5 text-ink-faint">{BAND_LABEL[b]}</span>
      </div>
    </div>
  );
}
