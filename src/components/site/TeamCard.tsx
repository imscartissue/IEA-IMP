import { cn } from "@/lib/utils";
import { Monogram } from "@/components/data-display/Monogram";

/**
 * One person card — modern sleek glassmorphism design.
 *
 * Circular portrait with gradient border, serif name, tracked role below.
 * Hover lifts the card, brightens the border, and reveals the monogram/photo
 * with a glow. Photos load from `public/people/<id>.jpg` when you set `photo`;
 * otherwise a monogram shows.
 */
export function TeamCard({
  name,
  role,
  photo,
  featured = false,
}: {
  name: string;
  role: string;
  photo?: string;
  featured?: boolean;
}) {
  return (
    <div className="flex flex-col items-center group">
      {/* Portrait — circular with animated gradient border. */}
      <div className={cn(
        "relative size-24 sm:size-36 rounded-full bg-canvas flex items-center justify-center transition-all duration-500 ease-brand",
        featured &&
          "relative size-32 sm:size-40 border-2 border-bronze bg-bronze-soft/30 group-hover:border-bronze group-hover:shadow-[0_0_40px_rgb(138_106_53_0.3)]",
        !featured &&
          "border border-rule-soft group-hover:border-bronze group-hover:shadow-[0_0_24px_rgb(138_106_53_0.12)]",
      )}>
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover rounded-full portrait-img"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-ink-faint font-serif text-[0.9375rem] font-bold tracking-[0.05em]">
            <Monogram name={name} size="md" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center">
        <p className={cn(
          "font-serif font-bold text-ink leading-tight text-center transition-colors duration-300 ease-brand group-hover:text-bronze",
          featured
            ? "min-w-[14rem] border border-bronze/60 bg-bronze-soft/20 px-4 py-2 text-[1rem] sm:text-[1.125rem]"
            : "text-[0.9375rem] sm:text-[1rem]",
        )}>
          {name}
        </p>
        <p className={cn(
          "mt-2 type-caption text-center text-ink-faint uppercase tracking-[0.14em] transition-colors duration-300 ease-brand group-hover:text-bronze group-hover:font-bold",
          featured ? "text-[0.8125rem]" : "text-[0.8125rem]",
        )}>
          {role}
        </p>
      </div>
    </div>
  );
}