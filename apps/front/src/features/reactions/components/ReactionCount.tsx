import { cva, type VariantProps } from "class-variance-authority";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CustomEmoji } from "@/features/emoji";
import { cn } from "@/lib/utils";

const textSizeBarient = {
  size: {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "40px": "text-[40px]",
  },
};
const emojiTextVariants = cva("", {
  variants: {
    size: textSizeBarient.size,
  },
  defaultVariants: { size: "sm" },
});

const emojiImgVariants = cva("", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-7 w-7",
      "40px": "h-[40px] w-[40px]",
    },
  },
  defaultVariants: { size: "sm" },
});

const countTextVariants = cva("font-medium", {
  variants: {
    size: textSizeBarient.size,
  },
  defaultVariants: { size: "sm" },
});

type EmojiSize = VariantProps<typeof emojiTextVariants>["size"];

export interface ReactionEmojiProps {
  reaction: string;
  isUnicodeEmoji: boolean;
  emojiUrl: string | null;
  emojis: Record<string, string>;
  size?: EmojiSize;
}

export function ReactionEmoji({
  reaction,
  isUnicodeEmoji,
  emojiUrl,
  emojis,
  size = "sm",
}: ReactionEmojiProps) {
  return (
    <>
      {isUnicodeEmoji ? (
        <span className={cn(emojiTextVariants({ size }))}>{reaction}</span>
      ) : emojiUrl ? (
        <Suspense fallback={<LoadingSpinner />}>
          <img
            src={emojiUrl}
            alt={reaction}
            className={cn(emojiImgVariants({ size }))}
            loading="lazy"
          />
        </Suspense>
      ) : (
        <span className={cn(emojiTextVariants({ size }))}>
          <CustomEmoji name={reaction.replace(/:/g, "")} emojis={emojis} />
        </span>
      )}
    </>
  );
}

interface ReactionCountProps extends ReactionEmojiProps {
  count: number;
}

export function ReactionCount(props: ReactionCountProps) {
  const { count } = props;
  return (
    <span className="flex items-center gap-1">
      <ReactionEmoji {...props} />
      <span className={cn(countTextVariants({ size: props.size }))}>
        {count}
      </span>
    </span>
  );
}
