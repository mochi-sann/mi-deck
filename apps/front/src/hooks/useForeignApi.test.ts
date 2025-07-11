import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForeignApi } from "./useForeignApi";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toUrl function
vi.mock("@/lib/utils/url", () => ({
  toUrl: (host: string) => {
    if (host.startsWith("http://") || host.startsWith("https://")) {
      return host;
    }
    return `https://${host}`;
  },
}));

describe("useForeignApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("hook initialization", () => {
    it("should return null when host is empty", () => {
      const { result } = renderHook(() => useForeignApi(""));

      expect(result.current).toBeNull();
    });

    it("should return null when host is null", () => {
      const { result } = renderHook(() => useForeignApi(null as any));

      expect(result.current).toBeNull();
    });

    it("should return null when host is undefined", () => {
      const { result } = renderHook(() => useForeignApi(undefined as any));

      expect(result.current).toBeNull();
    });

    it("should return API object when host is provided", () => {
      const { result } = renderHook(() => useForeignApi("example.com"));

      expect(result.current).not.toBeNull();
      expect(result.current).toHaveProperty("emojiUrl");
      expect(typeof result.current?.emojiUrl).toBe("function");
    });
  });

  describe("emojiUrl method", () => {
    it("should fetch emoji URL successfully", async () => {
      const mockResponse = {
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ url: "https://example.com/emoji.png" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBe("https://example.com/emoji.png");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/api/emoji?name=smile",
      );
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should handle host with https prefix", async () => {
      const mockResponse = {
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ url: "https://example.com/emoji.png" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("https://example.com"));

      await result.current?.emojiUrl("smile");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/api/emoji?name=smile",
      );
    });

    it("should handle host with http prefix", async () => {
      const mockResponse = {
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ url: "http://localhost:3000/emoji.png" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useForeignApi("http://localhost:3000"),
      );

      await result.current?.emojiUrl("smile");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/emoji?name=smile",
      );
    });

    it("should return null when API returns no URL", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ url: null }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
    });

    it("should return null when API returns empty URL", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ url: "" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
    });

    it("should return null when API returns undefined URL", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ url: undefined }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
    });

    it("should return null when API returns no data", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
    });

    it("should handle network errors gracefully", async () => {
      const mockError = new Error("Network error");
      mockFetch.mockRejectedValue(mockError);

      const { result } = renderHook(() => useForeignApi("example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to fetch emoji:",
        mockError,
      );
    });

    it("should handle JSON parsing errors", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to fetch emoji:",
        expect.any(Error),
      );
    });

    it("should handle special characters in emoji name", async () => {
      const mockResponse = {
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ url: "https://example.com/emoji.png" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      await result.current?.emojiUrl("smile_face");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/api/emoji?name=smile_face",
      );
    });

    it("should handle empty emoji name", async () => {
      const mockResponse = {
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ url: "https://example.com/emoji.png" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      await result.current?.emojiUrl("");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/api/emoji?name=",
      );
    });

    it("should handle non-200 responses", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockRejectedValue(new Error("Not found")),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useForeignApi("example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to fetch emoji:",
        expect.any(Error),
      );
    });
  });

  describe("hook re-renders", () => {
    it("should return same API instance for same host", () => {
      const { result, rerender } = renderHook(
        ({ host }) => useForeignApi(host),
        { initialProps: { host: "example.com" } },
      );

      const firstApi = result.current;

      rerender({ host: "example.com" });

      const secondApi = result.current;

      expect(firstApi).toBe(secondApi);
    });

    it("should return different API instance for different host", () => {
      const { result, rerender } = renderHook(
        ({ host }) => useForeignApi(host),
        { initialProps: { host: "example.com" } },
      );

      const firstApi = result.current;

      rerender({ host: "other.com" });

      const secondApi = result.current;

      expect(firstApi).not.toBe(secondApi);
    });

    it("should return null when host changes to empty", () => {
      const { result, rerender } = renderHook(
        ({ host }) => useForeignApi(host),
        { initialProps: { host: "example.com" } },
      );

      expect(result.current).not.toBeNull();

      rerender({ host: "" });

      expect(result.current).toBeNull();
    });
  });
});
