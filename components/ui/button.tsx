"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive touch-manipulation active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 border border-transparent",
        outline:
          "border border-secondary bg-background text-foreground hover:bg-secondary/10 hover:text-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 border border-transparent",
        ghost:
          "hover:bg-muted hover:text-foreground border border-transparent",
        link: "text-primary underline-offset-4 hover:underline border-none",
      },
      size: {
        default: "h-10 min-h-[44px] px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 min-h-[44px] rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 min-h-[44px] rounded-md px-6 has-[>svg]:px-4",
        icon: "size-10 min-h-[44px] min-w-[44px] rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
