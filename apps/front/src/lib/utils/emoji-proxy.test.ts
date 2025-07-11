import { describe, expect, it } from "vitest";
import { createEmojiProxyUrl, createProxiedEmojis } from "./emoji-proxy";

describe("createEmojiProxyUrl", () => {
  it("should create proxy URL for basic emoji", () => {
    const originalUrl = "https://example.com/emoji.png";
    const host = "misskey.example.com";
    const expected =
      "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Femoji.png&emoji=1";

    const result = createEmojiProxyUrl(originalUrl, host);

    expect(result).toBe(expected);
  });

  it("should handle host with https prefix", () => {
    const originalUrl = "https://example.com/emoji.png";
    const host = "https://misskey.example.com";
    const expected =
      "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Femoji.png&emoji=1";

    const result = createEmojiProxyUrl(originalUrl, host);

    expect(result).toBe(expected);
  });

  it("should handle host with http prefix", () => {
    const originalUrl = "https://example.com/emoji.png";
    const host = "http://localhost:3000";
    const expected =
      "http://localhost:3000/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Femoji.png&emoji=1";

    const result = createEmojiProxyUrl(originalUrl, host);

    expect(result).toBe(expected);
  });

  it("should return original URL when already proxied", () => {
    const originalUrl =
      "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Femoji.png&emoji=1";
    const host = "misskey.example.com";

    const result = createEmojiProxyUrl(originalUrl, host);

    expect(result).toBe(originalUrl);
  });

  it("should return original URL when host is empty", () => {
    const originalUrl = "https://example.com/emoji.png";
    const host = "";

    const result = createEmojiProxyUrl(originalUrl, host);

    expect(result).toBe(originalUrl);
  });

  it("should return original URL when URL is empty", () => {
    const originalUrl = "";
    const host = "misskey.example.com";

    const result = createEmojiProxyUrl(originalUrl, host);

    expect(result).toBe(originalUrl);
  });

  it("should handle special characters in URL", () => {
    const originalUrl = "https://example.com/emoji with spaces.png";
    const host = "misskey.example.com";
    const expected =
      "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Femoji%20with%20spaces.png&emoji=1";

    const result = createEmojiProxyUrl(originalUrl, host);

    expect(result).toBe(expected);
  });
});

describe("createProxiedEmojis", () => {
  it("should convert all emoji URLs to proxy URLs", () => {
    const emojis = {
      smile: "https://example.com/smile.png",
      heart: "https://example.com/heart.png",
      star: "https://example.com/star.png",
    };
    const host = "misskey.example.com";

    const result = createProxiedEmojis(emojis, host);

    expect(result).toEqual({
      smile:
        "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Fsmile.png&emoji=1",
      heart:
        "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Fheart.png&emoji=1",
      star: "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Fstar.png&emoji=1",
    });
  });

  it("should handle empty emojis object", () => {
    const emojis = {};
    const host = "misskey.example.com";

    const result = createProxiedEmojis(emojis, host);

    expect(result).toEqual({});
  });

  it("should return original object when host is empty", () => {
    const emojis = {
      smile: "https://example.com/smile.png",
    };
    const host = "";

    const result = createProxiedEmojis(emojis, host);

    expect(result).toEqual(emojis);
  });

  it("should return original object when emojis is null", () => {
    // biome-ignore lint/suspicious/noExplicitAny: テストで必須
    const emojis = null as any;
    const host = "misskey.example.com";

    const result = createProxiedEmojis(emojis, host);

    expect(result).toBeNull();
  });

  it("should return original object when emojis is undefined", () => {
    // biome-ignore lint/suspicious/noExplicitAny: テストで必須
    const emojis = undefined as any;
    const host = "misskey.example.com";

    const result = createProxiedEmojis(emojis, host);

    expect(result).toBeUndefined();
  });

  it("should handle mix of normal and already proxied URLs", () => {
    const emojis = {
      normal: "https://example.com/normal.png",
      proxied:
        "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Fproxied.png&emoji=1",
    };
    const host = "misskey.example.com";

    const result = createProxiedEmojis(emojis, host);

    expect(result).toEqual({
      normal:
        "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Fnormal.png&emoji=1",
      proxied:
        "https://misskey.example.com/proxy/emoji.webp?url=https%3A%2F%2Fexample.com%2Fproxied.png&emoji=1",
    });
  });
});
