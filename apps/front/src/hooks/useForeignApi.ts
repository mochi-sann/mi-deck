import { useMemo } from "react";
import { toUrl } from "@/lib/utils/url";

export function useForeignApi(host: string) {
  const apiInstance = useMemo(() => {
    if (!host) return null;

    return {
      emojiUrl: async (name: string): Promise<string | null> => {
        try {
          const response = await fetch(`${toUrl(host)}/api/emoji?name=${name}`);
          const data = await response.json();
          return data.url || null;
        } catch (error) {
          console.warn("Failed to fetch emoji:", error);
          return null;
        }
      },
    };
  }, [host]);

  return apiInstance;
}
