import { useQuery } from "@tanstack/react-query";
import * as Misskey from "misskey-js";
import type { EmojiSimple } from "misskey-js/entities.js";
import { useCallback, useMemo } from "react";
import { storageManager } from "@/lib/storage";

interface UseCustomEmojisOptions {
  origin: string;
}

interface CustomEmojiGroup {
  category: string | null;
  emojis: EmojiSimple[];
}

export function useCustomEmojis({ origin }: UseCustomEmojisOptions) {
  const createMisskeyClient = useCallback(async () => {
    await storageManager.initialize();
    const servers = await storageManager.getAllServers();
    const server = servers.find((s) => s.origin === origin && s.isActive);

    if (!server?.accessToken) {
      throw new Error(`No active server found for origin: ${origin}`);
    }

    return new Misskey.api.APIClient({
      origin: server.origin,
      credential: server.accessToken,
    });
  }, [origin]);

  // サーバーのカスタム絵文字一覧を取得
  const {
    data: emojis = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["custom-emojis", origin],
    queryFn: async (): Promise<EmojiSimple[]> => {
      const client = await createMisskeyClient();

      // emojisエンドポイントを使用してカスタム絵文字一覧を取得
      // レスポンス形式: { emojis: EmojiSimple[] }
      const response = await client.request("emojis");
      return response.emojis;
    },
    enabled: !!origin,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    gcTime: 1000 * 60 * 30, // 30分間ガベージコレクション対象外
  });

  // カテゴリ別にグループ化
  const emojiGroups = useMemo((): CustomEmojiGroup[] => {
    const groups = new Map<string | null, EmojiSimple[]>();

    for (const emoji of emojis) {
      const category = emoji.category;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(emoji);
    }

    // カテゴリなし（null）を最後に、その他をアルファベット順でソート
    const sortedGroups: CustomEmojiGroup[] = [];
    const sortedCategories = Array.from(groups.keys())
      .filter((cat) => cat !== null)
      .sort();

    // カテゴリありの絵文字を追加
    for (const category of sortedCategories) {
      const categoryEmojis = groups.get(category)!;
      // 絵文字を名前順でソート
      categoryEmojis.sort((a, b) => a.name.localeCompare(b.name));
      sortedGroups.push({
        category,
        emojis: categoryEmojis,
      });
    }

    // カテゴリなしの絵文字を最後に追加
    if (groups.has(null)) {
      const uncategorizedEmojis = groups.get(null)!;
      uncategorizedEmojis.sort((a, b) => a.name.localeCompare(b.name));
      sortedGroups.push({
        category: null,
        emojis: uncategorizedEmojis,
      });
    }

    return sortedGroups;
  }, [emojis]);

  // 検索機能
  const searchEmojis = useCallback(
    (query: string): EmojiSimple[] => {
      if (!query.trim()) return emojis;

      const lowercaseQuery = query.toLowerCase();
      return emojis.filter(
        (emoji) =>
          emoji.name.toLowerCase().includes(lowercaseQuery) ||
          emoji.aliases.some((alias) =>
            alias.toLowerCase().includes(lowercaseQuery),
          ),
      );
    },
    [emojis],
  );

  // 特定のカテゴリの絵文字を取得
  const getEmojisByCategory = useCallback(
    (category: string | null): EmojiSimple[] => {
      return emojis.filter((emoji) => emoji.category === category);
    },
    [emojis],
  );

  // リアクションとして使用可能な絵文字のみフィルタリング
  const getReactionableEmojis = useCallback(
    (userRoleIds: string[] = []): EmojiSimple[] => {
      return emojis.filter((emoji) => {
        // roleIdsThatCanBeUsedThisEmojiAsReactionが設定されていない場合は誰でも使用可能
        if (
          !emoji.roleIdsThatCanBeUsedThisEmojiAsReaction ||
          emoji.roleIdsThatCanBeUsedThisEmojiAsReaction.length === 0
        ) {
          return true;
        }

        // ユーザーが必要なロールを持っているかチェック
        return emoji.roleIdsThatCanBeUsedThisEmojiAsReaction.some((roleId) =>
          userRoleIds.includes(roleId),
        );
      });
    },
    [emojis],
  );

  return {
    emojis,
    emojiGroups,
    isLoading,
    isError,
    error,
    searchEmojis,
    getEmojisByCategory,
    getReactionableEmojis,
  };
}
