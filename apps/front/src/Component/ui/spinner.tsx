import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

const spinnerVariants = cva("animate-spin text-primary", {
  variants: {
    size: {
      default: "size-8",
      sm: "size-4",
      lg: "size-12",
      xl: "size-16",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <LoaderCircle
        ref={ref}
        className={cn(spinnerVariants({ size }), className)}
        {...props}
      />
    );
  },
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
