import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Toggle as TogglePrimitive } from "radix-ui"

/**
 * Re-themed: `outline-none` on the base (the global bronze
 * `:focus-visible` outline supplies the ring instead of the stock
 * `focus-visible:ring-[3px]`), `transition-colors` rather than
 * `transition-[color,box-shadow]`, and `data-[state=on]` mapped to the bronze
 * tint so an active filter chip reads as a filter rather than a toggle.
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm type-label whitespace-nowrap transition-colors duration-[120ms] outline-none hover:bg-bronze-wash hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-bronze-soft data-[state=on]:text-bronze-ink aria-invalid:border-band-weak [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-rule-soft bg-transparent",
      },
      size: {
        // `h-9` in the stock version is 36px, under the 44px touch minimum.
        default: "h-11 min-w-9 px-3 md:h-9",
        sm: "h-8 min-w-8 px-2",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
