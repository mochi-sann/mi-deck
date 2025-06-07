import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import React from "react";

export const TextVariants = cva("text-xl", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg: text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
    },
    affects: {
      default: "text-base",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      removeFiMargin: "[&:not(:first-child)]:mt-0",
    },
    colorType: {
      default: "text-foreground",
      denger: "text-red-500",
    },
  },
  defaultVariants: {
    variant: "p",
    affects: "default",
    colorType: "default",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof TextVariants> {}

const Text = React.forwardRef<HTMLHeadingElement, TextProps>(
  ({ className, variant, affects, colorType, ...props }, ref) => {
    const Comp = variant || "p";
    return (
      <Comp
        className={cn(TextVariants({ variant, colorType, affects, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Text.displayName = "p";

export default Text;
