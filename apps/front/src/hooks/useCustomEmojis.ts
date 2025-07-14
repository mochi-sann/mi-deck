import { useAtom, useAtomValue } from "jotai";
import { useMemo } from "react";
import { useForeignApi } from "@/hooks/useForeignApi";
import { emojiFetchAtom } from "@/lib/atoms/emoji-fetch";
import {
  emojiCacheAtom,
  updateEmojiCacheAtom,
} from "@/lib/database/emoji-cache-database";

/**
 * カスタム絵文字の取得とキャッシュを管理するフック
 * MFMテキスト内で使用される絵文字を事前に取得し、統一的に管理する
 */
export function useCustomEmojis(host: string) {
  const api = useForeignApi(host);
  const cache = useAtomValue(emojiCacheAtom);
  const [, updateCache] = useAtom(updateEmojiCacheAtom);
  const [fetches, setFetches] = useAtom(emojiFetchAtom);

  /**
   * 指定された絵文字名の配列を並列で取得する
   * キャッシュに存在する場合はキャッシュから、存在しない場合はAPIから取得
   */
  const fetchEmojis = useMemo(() => {
    return async (
      emojiNames: string[],
    ): Promise<Record<string, string | null>> => {
      if (!api || !host) return {};

      const result: Record<string, string | null> = {};
      const toFetch: string[] = [];

      // キャッシュから取得可能な絵文字をチェック
      for (const name of emojiNames) {
        if (cache[host]?.[name]) {
          result[name] = cache[host][name];
        } else {
          toFetch.push(name);
        }
      }

      // キャッシュにない絵文字を並列で取得
      if (toFetch.length > 0) {
        const fetchPromises = toFetch.map(async (name) => {
          const key = `${name}@${host}`;

          // 既に取得中の場合は既存のPromiseを使用
          if (key in fetches) {
            return { name, url: await fetches[key] };
          }

          // 新しく取得を開始
          const promise = api.emojiUrl(name);
          setFetches((prev) => ({ ...prev, [key]: promise }));

          try {
            const url = await promise;
            // 取得完了後、fetchesから削除
            setFetches((prev) => {
              const newFetches = { ...prev };
              delete newFetches[key];
              return newFetches;
            });
            return { name, url };
          } catch (error) {
            console.warn(`Failed to fetch emoji ${name}:`, error);
            setFetches((prev) => {
              const newFetches = { ...prev };
              delete newFetches[key];
              return newFetches;
            });
            return { name, url: null };
          }
        });

        const fetchResults = await Promise.all(fetchPromises);

        // 取得結果をキャッシュに保存
        const cacheUpdates: Record<string, string | null> = {};
        for (const { name, url } of fetchResults) {
          result[name] = url;
          cacheUpdates[name] = url;
        }

        if (Object.keys(cacheUpdates).length > 0) {
          updateCache({ host, cache: cacheUpdates });
        }
      }

      return result;
    };
  }, [api, host, cache, fetches, setFetches, updateCache]);

  /**
   * 単一の絵文字を取得する
   */
  const fetchEmoji = useMemo(() => {
    return async (emojiName: string): Promise<string | null> => {
      const result = await fetchEmojis([emojiName]);
      return result[emojiName] || null;
    };
  }, [fetchEmojis]);

  /**
   * キャッシュから絵文字URLを取得する（同期）
   */
  const getEmojiFromCache = useMemo(() => {
    return (emojiName: string): string | null => {
      return cache[host]?.[emojiName] || null;
    };
  }, [cache, host]);

  return {
    fetchEmojis,
    fetchEmoji,
    getEmojiFromCache,
    cache: cache[host] || {},
  };
}
