import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CustomEmoji } from "@/features/emoji";

type EmojiSize = "xs" | "sm" | "md" | "lg" | "xl";

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
  const textSize =
    size === "xs"
      ? "text-xs"
      : size === "md"
        ? "text-base"
        : size === "lg"
          ? "text-lg"
          : size === "xl"
            ? "text-calc(var(--spacing) * 10)"
            : "text-sm";
  const imgSize =
    size === "xs"
      ? "h-3 w-3"
      : size === "md"
        ? "h-5 w-5"
        : size === "lg"
          ? "h-6 w-6"
          : size === "xl"
            ? "h-10 w-10"
            : "h-4 w-4";
  return (
    <>
      {isUnicodeEmoji ? (
        <span className={textSize}>{reaction}</span>
      ) : emojiUrl ? (
        <Suspense fallback={<LoadingSpinner />}>
          <img
            src={emojiUrl}
            alt={reaction}
            className={imgSize}
            loading="lazy"
          />
        </Suspense>
      ) : (
        <span className={textSize}>
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
      <span className="font-medium">{count}</span>
    </span>
  );
}
