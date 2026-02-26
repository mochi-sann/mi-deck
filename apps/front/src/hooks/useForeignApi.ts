import { useMemo } from "react";
import { toUrl } from "@/lib/utils/url";

const emojiUrlResultCache = new Map<string, string | null>();
const emojiUrlInFlightCache = new Map<string, Promise<string | null>>();

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
            emojiUrlResultCache.set(cacheKey, url);
            return url;
          } catch (error) {
            console.warn("Failed to fetch emoji:", error);
            return null;
          } finally {
            emojiUrlInFlightCache.delete(cacheKey);
          }
        })();

        emojiUrlInFlightCache.set(cacheKey, request);

        try {
          return await request;
        } catch {
          return null;
        }
      },
    };
  }, [host]);

  return apiInstance;
}
