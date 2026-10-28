import { ScoreBar } from "@/components/data-display/ScoreBar";
import { band } from "@/lib/scoring";
import { cn } from "@/lib/utils";

/**
 * A metric score in a table cell.
 *
 * Always tabular so the column aligns on the decimal, always band-coloured so
 * the column can be read at a glance without reading the numbers, and — on
 * desktop — always paired with a bar. The number alone is not a comparison; the
 * bar is what makes a column scannable.
 *
 * `invert` marks the cost column. The value shown is always the 0-100
 * *desirability* score, never the raw cost rating, so a higher number always
 * means a better result and the "lower is better" note explains why the raw
 * metric was inverted. Showing the raw rating would make the column sort
 * backwards relative to its own header.
 */
export function ScoreCell({
  value,
  invert = false,
  bar = false,
  className,
}: {
  value: number;
  invert?: boolean;
  bar?: boolean;
  className?: string;
}) {
  const b = band(value);
  const colorBand = invert
    ? b === "strong"
      ? "weak"
      : b === "weak"
        ? "strong"
        : "fair"
    : b;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "type-numeric-sm",
            colorBand === "strong" && "text-band-strong",
            colorBand === "fair" && "text-band-fair",
            colorBand === "weak" && "text-band-weak",
          )}
        >
          {value.toFixed(1)}
        </span>
        {invert ? (
          <span className="type-caption text-ink-faint" title="Inverted: a lower cost rating ranks higher">
            ↓
          </span>
        ) : null}
      </div>
      {bar ? <ScoreBar value={value} size="sm" tone={colorBand} label={`${value.toFixed(1)} out of 100`} /> : null}
    </div>
  );
}

/** The overall score, set larger than the metric cells — it is the headline. */
export function OverallCell({ value }: { value: number }) {
  const b = band(value);
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span
        className={cn(
          "type-numeric",
          b === "strong" && "text-band-strong",
          b === "fair" && "text-band-fair",
          b === "weak" && "text-band-weak",
        )}
      >
        {value.toFixed(1)}
      </span>
      <ScoreBar value={value} size="sm" label={`Overall ${value.toFixed(1)} out of 100`} />
    </div>
  );
}
