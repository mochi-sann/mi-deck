import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

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
  extends
    React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * The speed of the spinner animation in milliseconds.
   * @default 1000
   */
  speed?: number;
  /**
   * Center the spinner within the parent container both vertically and horizontally.
   */
  center?: boolean;
  /**
   * Backward compatible alias for `center` prop.
   */
  Center?: boolean;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  (
    { className, variant, size, speed = 1000, center, Center, ...props },
    ref,
  ) => {
    const shouldCenter = center ?? Center ?? false;

    const spinnerElement = (
      <LoaderCircle
        ref={ref}
        className={cn(spinnerVariants({ variant, size }), className)}
        style={{
          animationDuration: `${speed}ms`,
        }}
        {...props}
      />
    );

    if (!shouldCenter) return spinnerElement;

    return (
      <div className="flex h-full w-full items-center justify-center">
        {spinnerElement}
      </div>
    );
  },
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
