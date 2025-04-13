import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

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
  VariantProps<typeof spinnerVariants> { }

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div className="">
        <LoaderCircle {...props} />
      </div>
    );
  },
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
