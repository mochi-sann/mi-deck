import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CustomEmoji } from "@/features/emoji";

interface ReactionEmojiProps {
  reaction: string;
  isUnicodeEmoji: boolean;
  emojiUrl: string | null;
  emojis: Record<string, string>;
}

export function ReactionEmoji({
  reaction,
  isUnicodeEmoji,
  emojiUrl,
  emojis,
}: ReactionEmojiProps) {
  return (
    <>
      {isUnicodeEmoji ? (
        <span className="text-sm">{reaction}</span>
      ) : emojiUrl ? (
        <Suspense fallback={<LoadingSpinner />}>
          <img
            src={emojiUrl}
            alt={reaction}
            className="h-4 w-4"
            loading="lazy"
          />
        </Suspense>
      ) : (
        <CustomEmoji name={reaction.replace(/:/g, "")} emojis={emojis} />
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
