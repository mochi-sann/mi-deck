import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "",
      muted: "text-muted-foreground",
      destructive: "text-destructive",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      default: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    },
    weight: {
      thin: "font-thin",
      extralight: "font-extralight",
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    weight: "normal",
    align: "left",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
  VariantProps<typeof textVariants> {
  asChild?: boolean;
  as?: "p" | "span" | "div" | "label"; // Allow specifying the underlying element
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      className,
      variant,
      size,
      weight,
      align,
      asChild = false,
      as: Component = "p", // Default to 'p' tag
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : Component;
    return (
      <Comp
        className={cn(
          textVariants({ variant, size, weight, align, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text, textVariants };
