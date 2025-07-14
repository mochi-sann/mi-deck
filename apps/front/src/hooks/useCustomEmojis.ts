import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
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

  // Use refs to maintain stable references for the callback
  const cacheRef = useRef(cache);
  const fetchesRef = useRef(fetches);
  const updateCacheRef = useRef(updateCache);
  const setFetchesRef = useRef(setFetches);

  // Update refs when values change using useEffect to avoid direct mutation
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  useEffect(() => {
    fetchesRef.current = fetches;
  }, [fetches]);

  useEffect(() => {
    updateCacheRef.current = updateCache;
  }, [updateCache]);

  useEffect(() => {
    setFetchesRef.current = setFetches;
  }, [setFetches]);

  /**
   * 指定された絵文字名の配列を並列で取得する
   * キャッシュに存在する場合はキャッシュから、存在しない場合はAPIから取得
   */
  const fetchEmojis = useCallback(
    async (emojiNames: string[]): Promise<Record<string, string | null>> => {
      if (!api || !host) return {};

      const result: Record<string, string | null> = {};
      const toFetch: string[] = [];

      // キャッシュから取得可能な絵文字をチェック
      for (const name of emojiNames) {
        if (cacheRef.current[host]?.[name]) {
          result[name] = cacheRef.current[host][name];
        } else {
          toFetch.push(name);
        }
      }

      // キャッシュにない絵文字を並列で取得
      if (toFetch.length > 0) {
        const fetchPromises = toFetch.map(async (name) => {
          const key = `${name}@${host}`;

          // 既に取得中の場合は既存のPromiseを使用
          if (key in fetchesRef.current) {
            return { name, url: await fetchesRef.current[key] };
          }

          // 新しく取得を開始
          const promise = api.emojiUrl(name);
          setFetchesRef.current((prev) => ({ ...prev, [key]: promise }));

          try {
            const url = await promise;
            // 取得完了後、fetchesから削除
            setFetchesRef.current((prev) => {
              const newFetches = { ...prev };
              delete newFetches[key];
              return newFetches;
            });
            return { name, url };
          } catch (error) {
            console.warn(`Failed to fetch emoji ${name}:`, error);
            setFetchesRef.current((prev) => {
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
          updateCacheRef.current({ host, cache: cacheUpdates });
        }
      }

      return result;
    },
    [api, host],
  );

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
  const getEmojiFromCache = useCallback(
    (emojiName: string): string | null => {
      return cacheRef.current[host]?.[emojiName] || null;
    },
    [host],
  );

  // Memoize the cache for this host to prevent unnecessary re-renders
  const hostCache = useMemo(() => cache[host] || {}, [cache, host]);

  return {
    fetchEmojis,
    fetchEmoji,
    getEmojiFromCache,
    cache: hostCache,
  };
}
