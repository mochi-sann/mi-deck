import { renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Get the global server from test setup
import { server } from "@/test/setup";
import { useForeignApi } from "./useForeignApi";

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
      // biome-ignore lint/suspicious/noExplicitAny: テストで必須
      const { result } = renderHook(() => useForeignApi(null as any));

      expect(result.current).toBeNull();
    });

    it("should return null when host is undefined", () => {
      // biome-ignore lint/suspicious/noExplicitAny: テストで必須
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
      server.use(
        http.get("https://test-example.com/api/emoji", ({ request }) => {
          const url = new URL(request.url);
          const name = url.searchParams.get("name");

          if (name === "smile") {
            return HttpResponse.json({
              url: "https://test-example.com/emoji.png",
            });
          }

          return HttpResponse.json({ url: null });
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-example.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBe("https://test-example.com/emoji.png");
    });

    it("should handle host with https prefix", async () => {
      server.use(
        http.get("https://test-https.com/api/emoji", ({ request }) => {
          const url = new URL(request.url);
          const name = url.searchParams.get("name");

          if (name === "smile") {
            return HttpResponse.json({
              url: "https://test-https.com/emoji.png",
            });
          }

          return HttpResponse.json({ url: null });
        }),
      );

      const { result } = renderHook(() =>
        useForeignApi("https://test-https.com"),
      );

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBe("https://test-https.com/emoji.png");
    });

    it("should handle host with http prefix", async () => {
      server.use(
        http.get("http://test-http.local:3000/api/emoji", ({ request }) => {
          const url = new URL(request.url);
          const name = url.searchParams.get("name");

          if (name === "smile") {
            return HttpResponse.json({
              url: "http://test-http.local:3000/emoji.png",
            });
          }

          return HttpResponse.json({ url: null });
        }),
      );

      const { result } = renderHook(() =>
        useForeignApi("http://test-http.local:3000"),
      );

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBe("http://test-http.local:3000/emoji.png");
    });

    it("should return null when API returns no URL", async () => {
      server.use(
        http.get("https://test-null.com/api/emoji", () => {
          return HttpResponse.json({ url: null });
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-null.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
    });

    it("should return null when API returns empty URL", async () => {
      server.use(
        http.get("https://test-empty.com/api/emoji", () => {
          return HttpResponse.json({ url: "" });
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-empty.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
    });

    it("should return null when API returns undefined URL", async () => {
      server.use(
        http.get("https://test-undefined.com/api/emoji", () => {
          return HttpResponse.json({ url: undefined });
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-undefined.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
    });

    it("should return null when API returns no data", async () => {
      server.use(
        http.get("https://test-nodata.com/api/emoji", () => {
          return HttpResponse.json({});
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-nodata.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
    });

    it("should handle network errors gracefully", async () => {
      server.use(
        http.get("https://test-error.com/api/emoji", () => {
          return HttpResponse.error();
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-error.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to fetch emoji:",
        expect.any(Error),
      );
    });

    it("should handle JSON parsing errors", async () => {
      server.use(
        http.get("https://test-json.com/api/emoji", () => {
          return new HttpResponse("invalid json", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-json.com"));

      const emojiUrl = await result.current?.emojiUrl("smile");

      expect(emojiUrl).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to fetch emoji:",
        expect.any(Error),
      );
    });

    it("should handle special characters in emoji name", async () => {
      server.use(
        http.get("https://test-special.com/api/emoji", ({ request }) => {
          const url = new URL(request.url);
          const name = url.searchParams.get("name");

          if (name === "smile_face") {
            return HttpResponse.json({
              url: "https://test-special.com/emoji.png",
            });
          }

          return HttpResponse.json({ url: null });
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-special.com"));

      const emojiUrl = await result.current?.emojiUrl("smile_face");

      expect(emojiUrl).toBe("https://test-special.com/emoji.png");
    });

    it("should handle empty emoji name", async () => {
      server.use(
        http.get("https://test-empty-name.com/api/emoji", ({ request }) => {
          const url = new URL(request.url);
          const name = url.searchParams.get("name");

          if (name === "") {
            return HttpResponse.json({
              url: "https://test-empty-name.com/emoji.png",
            });
          }

          return HttpResponse.json({ url: null });
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-empty-name.com"));

      const emojiUrl = await result.current?.emojiUrl("");

      expect(emojiUrl).toBe("https://test-empty-name.com/emoji.png");
    });

    it("should handle non-200 responses", async () => {
      server.use(
        http.get("https://test-404.com/api/emoji", () => {
          return new HttpResponse(null, { status: 404 });
        }),
      );

      const { result } = renderHook(() => useForeignApi("test-404.com"));

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
