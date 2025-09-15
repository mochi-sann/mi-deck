import { Separator } from "@/components/ui/separator";
import { ReactionEmoji } from "./ReactionCount";

interface ReactionHoverContentProps {
  reaction: string;
  isUnicodeEmoji: boolean;
  emojiUrl: string | null;
  emojis: Record<string, string>;
  reactionsRaw: any[];
}

export function ReactionHoverContent({
  reaction,
  isUnicodeEmoji,
  emojiUrl,
  emojis,
  reactionsRaw,
}: ReactionHoverContentProps) {
  const filtered = Array.isArray(reactionsRaw)
    ? reactionsRaw.filter((r: any) => r?.type === reaction)
    : [];

  return (
    <>
      <ReactionEmoji
        reaction={reaction}
        isUnicodeEmoji={isUnicodeEmoji}
        emojiUrl={emojiUrl}
        emojis={emojis}
      />
      <Separator orientation="vertical" className="mx-2 h-full" />
      <pre>
        {filtered.map((value: any) => (
          <div key={value.id} className="border-b p-1 last:border-0">
            {value?.user?.name}
          </div>
        ))}
      </pre>
    </>
  );
}
