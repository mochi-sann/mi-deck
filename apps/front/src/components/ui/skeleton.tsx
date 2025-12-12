import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva("animate-pulse rounded-md bg-accent", {
  variants: {
    variant: {
      default: "bg-accent",
      primary: "bg-primary/10",
      secondary: "bg-secondary/10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface SkeletonProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
