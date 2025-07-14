import { renderHook } from "@testing-library/react";
import { atom, Provider } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCustomEmojis } from "./useCustomEmojis";

// Mock the useForeignApi hook
vi.mock("@/hooks/useForeignApi", () => ({
  useForeignApi: vi.fn(),
}));

// Mock the emoji cache atoms
vi.mock("@/lib/database/emoji-cache-database", () => ({
  emojiCacheAtom: atom({}),
  updateEmojiCacheAtom: atom(null, () => {}),
}));

// Mock the emoji fetch atom
vi.mock("@/lib/atoms/emoji-fetch", () => ({
  emojiFetchAtom: atom({}),
}));

// Import mocked modules
import { useForeignApi } from "@/hooks/useForeignApi";

describe("useCustomEmojis", () => {
  const mockApi = {
    emojiUrl: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useForeignApi).mockReturnValue(mockApi);
  });

  const renderHookWithProvider = (host: string) => {
    return renderHook(() => useCustomEmojis(host), {
      wrapper: ({ children }) => <Provider>{children}</Provider>,
    });
  };

  describe("fetchEmojis", () => {
    it("should return empty object when no api", async () => {
      vi.mocked(useForeignApi).mockReturnValue(null);

      const { result } = renderHookWithProvider("example.com");
      const emojis = await result.current.fetchEmojis(["test"]);
      expect(emojis).toEqual({});
    });

    it("should return empty object when no host", async () => {
      const { result } = renderHookWithProvider("");
      const emojis = await result.current.fetchEmojis(["test"]);
      expect(emojis).toEqual({});
    });

    it("should fetch emojis from API when not in cache", async () => {
      mockApi.emojiUrl.mockResolvedValue("http://example.com/emoji.png");

      const { result } = renderHookWithProvider("example.com");
      const emojis = await result.current.fetchEmojis(["testEmoji"]);

      expect(mockApi.emojiUrl).toHaveBeenCalledWith("testEmoji");
      expect(emojis).toEqual({
        testEmoji: "http://example.com/emoji.png",
      });
    });

    it("should handle API errors gracefully", async () => {
      mockApi.emojiUrl.mockRejectedValue(new Error("API Error"));

      const { result } = renderHookWithProvider("example.com");
      const emojis = await result.current.fetchEmojis(["testEmoji"]);

      expect(emojis).toEqual({
        testEmoji: null,
      });
    });

    it("should fetch multiple emojis in parallel", async () => {
      mockApi.emojiUrl
        .mockResolvedValueOnce("http://example.com/emoji1.png")
        .mockResolvedValueOnce("http://example.com/emoji2.png");

      const { result } = renderHookWithProvider("example.com");
      const emojis = await result.current.fetchEmojis(["emoji1", "emoji2"]);

      expect(mockApi.emojiUrl).toHaveBeenCalledTimes(2);
      expect(emojis).toEqual({
        emoji1: "http://example.com/emoji1.png",
        emoji2: "http://example.com/emoji2.png",
      });
    });
  });

  describe("fetchEmoji", () => {
    it("should fetch single emoji", async () => {
      mockApi.emojiUrl.mockResolvedValue("http://example.com/emoji.png");

      const { result } = renderHookWithProvider("example.com");
      const emoji = await result.current.fetchEmoji("testEmoji");

      expect(emoji).toBe("http://example.com/emoji.png");
    });

    it("should return null for missing emoji", async () => {
      mockApi.emojiUrl.mockResolvedValue(null);

      const { result } = renderHookWithProvider("example.com");
      const emoji = await result.current.fetchEmoji("missingEmoji");

      expect(emoji).toBeNull();
    });
  });

  describe("getEmojiFromCache", () => {
    it("should return null for emoji not in cache", () => {
      const { result } = renderHookWithProvider("example.com");
      const emoji = result.current.getEmojiFromCache("missingEmoji");

      expect(emoji).toBeNull();
    });
  });

  describe("cache property", () => {
    it("should return empty object when no cache", () => {
      const { result } = renderHookWithProvider("example.com");
      expect(result.current.cache).toEqual({});
    });
  });
});
