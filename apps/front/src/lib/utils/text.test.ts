import { describe, expect, it } from "vitest";
import { getWordBreakClasses, isJapaneseText } from "./text";

describe("isJapaneseText", () => {
  it("should return true for Japanese text with hiragana", () => {
    expect(isJapaneseText("こんにちは")).toBe(true);
  });

  it("should return true for Japanese text with katakana", () => {
    expect(isJapaneseText("コンニチハ")).toBe(true);
  });

  it("should return true for Japanese text with kanji", () => {
    expect(isJapaneseText("日本語")).toBe(true);
  });

  it("should return true for mixed Japanese text", () => {
    expect(isJapaneseText("こんにちは、世界！")).toBe(true);
  });

  it("should return true for Japanese with some English (>20% Japanese)", () => {
    expect(isJapaneseText("Hello 世界")).toBe(true);
  });

  it("should return false for English text", () => {
    expect(isJapaneseText("Hello World")).toBe(false);
  });

  it("should return false for numbers only", () => {
    expect(isJapaneseText("123456")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isJapaneseText("")).toBe(false);
  });

  it("should return false for whitespace only", () => {
    expect(isJapaneseText("   ")).toBe(false);
  });

  it("should handle mixed text with Japanese minority (<20%)", () => {
    expect(
      isJapaneseText("This is a very long English sentence with 日本語"),
    ).toBe(false);
  });

  it("should handle URLs with Japanese text", () => {
    expect(isJapaneseText("https://example.com/日本語ページ")).toBe(true);
  });
});

describe("getWordBreakClasses", () => {
  it("should return base classes for English text", () => {
    const result = getWordBreakClasses("Hello World");
    expect(result).toBe("break-words overflow-wrap-anywhere max-w-full");
    expect(result).not.toContain("break-all");
  });

  it("should include break-all for Japanese text", () => {
    const result = getWordBreakClasses("こんにちは世界");
    expect(result).toBe(
      "break-words overflow-wrap-anywhere max-w-full break-all",
    );
  });

  it("should include break-all for mixed Japanese text", () => {
    const result = getWordBreakClasses("Hello 世界");
    expect(result).toBe(
      "break-words overflow-wrap-anywhere max-w-full break-all",
    );
  });

  it("should handle long URLs with Japanese", () => {
    const longUrl = "https://example.com/日本語ページ";
    const result = getWordBreakClasses(longUrl);
    expect(result).toContain("break-all");
  });

  it("should not include break-all for English URLs", () => {
    const longUrl = "https://example.com/very-long-english-path";
    const result = getWordBreakClasses(longUrl);
    expect(result).not.toContain("break-all");
  });

  it("should handle empty string", () => {
    const result = getWordBreakClasses("");
    expect(result).toBe("break-words overflow-wrap-anywhere max-w-full");
  });
});
