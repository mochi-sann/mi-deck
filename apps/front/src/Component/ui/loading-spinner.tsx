import * as React from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "./spinner"; // Assuming spinner.tsx exports a Spinner component

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", text, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-2",
          className,
        )}
        {...props}
      >
        <Spinner className={cn(sizeClasses[size])} />
        {text && <span className="text-muted-foreground text-sm">{text}</span>}
      </div>
    );
  },
);
LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
