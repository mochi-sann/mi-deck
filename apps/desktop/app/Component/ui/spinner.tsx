import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

const spinnerVariants = cva("animate-spin", {
  variants: {
    variant: {
      default: "text-primary",
      primary: "text-primary",
      secondary: "text-secondary",
      muted: "text-muted-foreground",
    },
    size: {
      default: "size-8",
      sm: "size-4",
      sl: "size-6",
      lg: "size-12",
      xl: "size-16",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * The speed of the spinner animation in milliseconds.
   * @default 1000
   */
  speed?: number;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, variant, size, speed = 1000, ...props }, ref) => {
    return (
      <LoaderCircle
        ref={ref}
        className={cn(spinnerVariants({ variant, size }), className)}
        style={{
          animationDuration: `${speed}ms`,
        }}
        {...props}
      />
    );
  },
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
