import { Search } from "lucide-react";
import type { EmojiSimple } from "misskey-js/entities.js";
import { memo, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomEmojis } from "@/hooks/useCustomEmojis";
import { useForeignApi } from "@/hooks/useForeignApi";
import { cn } from "@/lib/utils";

interface CustomEmojiPickerProps {
  origin: string;
  onEmojiSelect: (emojiName: string) => void;
  className?: string;
  reactionEmojis?: Record<string, string>;
  fallbackEmojis?: Record<string, string>;
}

const EMOJIS_PER_ROW = 8;

function CustomEmojiPickerBase({
  origin,
  onEmojiSelect,
  className,
  reactionEmojis = {},
  fallbackEmojis = {},
}: CustomEmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [serverEmojis, setServerEmojis] = useState<EmojiSimple[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useForeignApi(origin);
  const { cache } = useCustomEmojis(origin);

  // サーバーの絵文字一覧を取得
  useEffect(() => {
    if (!api) return;

    setIsLoading(true);
    fetch(`${origin.replace(/\/$/, "")}/api/emojis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then((res) => res.json())
      .then((response: { emojis?: EmojiSimple[] } | EmojiSimple[]) => {
        const list = Array.isArray(response)
          ? response
          : (response?.emojis ?? []);
        setServerEmojis(list);
        setError(null);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch server emojis:", err);
        setError("絵文字の取得に失敗しました");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [api, origin]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return serverEmojis.filter(
      (emoji) =>
        emoji.name.toLowerCase().includes(query) ||
        emoji.aliases?.some((alias) => alias.toLowerCase().includes(query)),
    );
  }, [searchQuery, serverEmojis]);

  const groupedEmojis = useMemo(() => {
    const groups: Record<string, EmojiSimple[]> = {};
    serverEmojis.forEach((emoji) => {
      const category = emoji.category || "その他";
      if (!groups[category]) groups[category] = [];
      groups[category].push(emoji);
    });
    return groups;
  }, [serverEmojis]);

  const categories = useMemo(() => {
    return Object.keys(groupedEmojis).sort();
  }, [groupedEmojis]);

  const handleEmojiClick = (emoji: EmojiSimple) => {
    onEmojiSelect(emoji.name);
  };

  const getEmojiUrl = (emoji: EmojiSimple): string => {
    const fullName = `${emoji.name}@${origin.replace(/^https?:\/\//, "")}`;

    if (reactionEmojis[fullName]) return reactionEmojis[fullName];
    if (reactionEmojis[`:${emoji.name}:`])
      return reactionEmojis[`:${emoji.name}:`];

    if (cache[emoji.name]) return cache[emoji.name] ?? "";

    if (fallbackEmojis[emoji.name]) return fallbackEmojis[emoji.name];

    return emoji.url ?? "";
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex h-48 w-full items-center justify-center",
          className,
        )}
      >
        <div className="text-muted-foreground text-sm">
          絵文字を読み込み中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex h-48 w-full items-center justify-center",
          className,
        )}
      >
        <div className="text-muted-foreground text-sm">
          絵文字の読み込みに失敗しました
        </div>
      </div>
    );
  }

  const EmojiGrid = ({ emojis }: { emojis: EmojiSimple[] }) => {
    if (emojis.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
          絵文字が見つかりません
        </div>
      );
    }

    return (
      <div
        className="grid gap-1 p-2"
        style={{
          gridTemplateColumns: `repeat(${EMOJIS_PER_ROW}, minmax(0, 1fr))`,
        }}
      >
        {emojis.map((emoji) => (
          <Button
            key={emoji.name}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => handleEmojiClick(emoji)}
            title={`:${emoji.name}:`}
          >
            <img
              src={getEmojiUrl(emoji)}
              alt={`:${emoji.name}:`}
              className="h-4 w-4"
              loading="lazy"
            />
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("w-full rounded-lg border bg-background", className)}>
      <div className="border-b p-3">
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="絵文字を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {searchQuery.trim() ? (
        <div className="h-48 overflow-y-auto">
          <EmojiGrid emojis={searchResults} />
        </div>
      ) : (
        <div className="w-full">
          <div className="flex border-b">
            <Button
              variant={activeTab === "recent" ? "default" : "ghost"}
              size="sm"
              className="flex-1 rounded-none"
              onClick={() => setActiveTab("recent")}
            >
              最近
            </Button>
            <Button
              variant={activeTab === "categories" ? "default" : "ghost"}
              size="sm"
              className="flex-1 rounded-none"
              onClick={() => setActiveTab("categories")}
            >
              カテゴリ
            </Button>
          </div>

          <div className="h-48 overflow-y-auto">
            {activeTab === "recent" ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                最近使用した絵文字はありません
              </div>
            ) : categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category} className="space-y-2">
                    <div className="bg-muted/50 px-3 py-1 font-medium text-muted-foreground text-sm">
                      {category}
                    </div>
                    <EmojiGrid emojis={groupedEmojis[category]} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                カスタム絵文字がありません
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const CustomEmojiPicker = memo(CustomEmojiPickerBase);
