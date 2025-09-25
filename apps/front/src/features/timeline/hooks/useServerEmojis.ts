import { useQuery } from "@tanstack/react-query";
import * as Misskey from "misskey-js";
import type { EmojiSimple } from "misskey-js/entities.js";
import { useCallback, useMemo } from "react";
import { storageManager } from "@/lib/storage";

interface UseServerEmojisOptions {
  origin: string;
  userRoleIds?: string[];
}

interface GroupedEmojis {
  [category: string]: EmojiSimple[];
}

interface RecentEmojiData {
  name: string;
  lastUsed: number;
}

export function useServerEmojis({
  origin,
  userRoleIds = [],
}: UseServerEmojisOptions) {
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

  const {
    data: emojis = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["server-emojis", origin],
    queryFn: async () => {
      const client = await createMisskeyClient();
      const response = await client.request("emojis", {});
      return response.emojis || [];
    },
    enabled: !!origin,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    refetchInterval: false,
  });

  const filteredEmojis = useMemo(() => {
    if (!emojis.length) return [];

    return emojis.filter((emoji: EmojiSimple) => {
      if (emoji.roleIdsThatCanBeUsedThisEmojiAsReaction) {
        const allowedRoles = emoji.roleIdsThatCanBeUsedThisEmojiAsReaction;
        if (
          allowedRoles.length > 0 &&
          !allowedRoles.some((roleId: string) => userRoleIds.includes(roleId))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [emojis, userRoleIds]);

  const groupedEmojis = useMemo((): GroupedEmojis => {
    const groups: GroupedEmojis = {};

    for (const emoji of filteredEmojis) {
      const category = emoji.category || "その他";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(emoji);
    }

    Object.keys(groups).forEach((category) => {
      groups[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [filteredEmojis]);

  const searchEmojis = useCallback(
    (query: string): EmojiSimple[] => {
      if (!query.trim()) return [];

      const lowerQuery = query.toLowerCase();
      return filteredEmojis.filter(
        (emoji: EmojiSimple) =>
          emoji.name.toLowerCase().includes(lowerQuery) ||
          emoji.aliases.some((alias: string) =>
            alias.toLowerCase().includes(lowerQuery),
          ),
      );
    },
    [filteredEmojis],
  );

  const getRecentEmojis = useCallback((): EmojiSimple[] => {
    try {
      const recentData = localStorage.getItem(`recent-emojis-${origin}`);
      if (!recentData) return [];

      const recent: RecentEmojiData[] = JSON.parse(recentData);
      const recentNames = recent
        .sort((a, b) => b.lastUsed - a.lastUsed)
        .slice(0, 20)
        .map((item) => item.name);

      return recentNames
        .map((name: string) =>
          filteredEmojis.find((emoji: EmojiSimple) => emoji.name === name),
        )
        .filter((emoji): emoji is EmojiSimple => emoji !== undefined);
    } catch (error) {
      console.warn("Failed to load recent emojis:", error);
      return [];
    }
  }, [filteredEmojis, origin]);

  const addToRecentEmojis = useCallback(
    (emojiName: string) => {
      try {
        const key = `recent-emojis-${origin}`;
        const existing = localStorage.getItem(key);
        let recent: RecentEmojiData[] = existing ? JSON.parse(existing) : [];

        recent = recent.filter((item) => item.name !== emojiName);
        recent.unshift({
          name: emojiName,
          lastUsed: Date.now(),
        });

        recent = recent.slice(0, 50);

        localStorage.setItem(key, JSON.stringify(recent));
      } catch (error) {
        console.warn("Failed to save recent emoji:", error);
      }
    },
    [origin],
  );

  const categories = useMemo(() => {
    const cats = Object.keys(groupedEmojis).sort((a, b) => {
      if (a === "その他") return 1;
      if (b === "その他") return -1;
      return a.localeCompare(b);
    });
    return cats;
  }, [groupedEmojis]);

  return {
    emojis: filteredEmojis,
    groupedEmojis,
    categories,
    searchEmojis,
    getRecentEmojis,
    addToRecentEmojis,
    isLoading,
    error,
  };
}
