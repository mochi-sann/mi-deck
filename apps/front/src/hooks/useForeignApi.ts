import { useMemo } from "react";
import { toUrl } from "@/lib/utils/url";

const MAX_EMOJI_CACHE_ENTRIES = 2000;
const emojiUrlResultCache = new Map<string, string | null>();
const emojiUrlInFlightCache = new Map<string, Promise<string | null>>();

const setCacheWithLimit = <T>(map: Map<string, T>, key: string, value: T) => {
  if (map.has(key)) {
    map.delete(key);
  }
  map.set(key, value);

  if (map.size > MAX_EMOJI_CACHE_ENTRIES) {
    const oldestKey = map.keys().next().value;
    if (oldestKey) {
      map.delete(oldestKey);
    }
  }
};

export function useForeignApi(host: string) {
  const apiInstance = useMemo(() => {
    if (!host) return null;
    const baseUrl = toUrl(host);

    return {
      emojiUrl: async (name: string): Promise<string | null> => {
        const cacheKey = `${baseUrl}::${name}`;
        if (emojiUrlResultCache.has(cacheKey)) {
          return emojiUrlResultCache.get(cacheKey) ?? null;
        }

        const inFlight = emojiUrlInFlightCache.get(cacheKey);
        if (inFlight) {
          return inFlight;
        }

        const request = (async (): Promise<string | null> => {
          const encodedName = encodeURIComponent(name);
          const endpoint = `${baseUrl}/api/emoji?name=${encodedName}`;

          try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const url =
              typeof data?.url === "string" && data.url.length > 0
                ? data.url
                : null;
            setCacheWithLimit(emojiUrlResultCache, cacheKey, url);
            return url;
          } catch (error) {
            console.warn("Failed to fetch emoji:", error);
            return null;
          } finally {
            emojiUrlInFlightCache.delete(cacheKey);
          }
        })();

        setCacheWithLimit(emojiUrlInFlightCache, cacheKey, request);
        return request;
      },
    };
  }, [host]);

  return apiInstance;
}
