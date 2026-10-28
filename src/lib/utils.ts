import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * The only sanctioned way to concatenate class names in this codebase.
 *
 * `clsx` handles conditionals/arrays/objects; `tailwind-merge` resolves
 * conflicting Tailwind utilities so a `className` passed to a component wins
 * over the primitive's default rather than fighting it.
 *
 * Do not build class names with template literals — that is how specificity
 * bugs and accidental unstyled elements get in.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
