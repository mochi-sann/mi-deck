import { describe, expect, it } from "vitest";
import { ccodestr, convertToRgba } from "./Fn";

describe("convertToRgba", () => {
  it("4桁色コードを正しくRGBAに変換する", () => {
    expect(convertToRgba("ff00")).toBe("rgba(255, 255, 0, 0)");
    expect(convertToRgba("f05a")).toBe("rgba(255, 0, 85, 0.6666666666666666)");
    expect(convertToRgba("0000")).toBe("rgba(0, 0, 0, 0)");
    expect(convertToRgba("ffff")).toBe("rgba(255, 255, 255, 1)");
    expect(convertToRgba("7772")).toBe(
      "rgba(119, 119, 119, 0.13333333333333333)",
    );
  });

  it("各桁が正しく変換される", () => {
    // F = 15 → 15 * 17 = 255
    expect(convertToRgba("f000")).toBe("rgba(255, 0, 0, 0)");
    // 8 = 8 → 8 * 17 = 136
    expect(convertToRgba("8000")).toBe("rgba(136, 0, 0, 0)");
    // 透明度: F = 15 → 15 / 15 = 1
    expect(convertToRgba("000f")).toBe("rgba(0, 0, 0, 1)");
    // 透明度: 8 = 8 → 8 / 15 ≈ 0.533
    expect(convertToRgba("0008")).toBe("rgba(0, 0, 0, 0.5333333333333333)");
  });
});

describe("ccodestr", () => {
  it("3桁色コードを正しく処理する", () => {
    expect(ccodestr("f0f")).toBe("#f0f");
    expect(ccodestr("abc")).toBe("#abc");
    expect(ccodestr("123")).toBe("#123");
  });

  it("6桁色コードを正しく処理する", () => {
    expect(ccodestr("ff00ff")).toBe("#ff00ff");
    expect(ccodestr("abcdef")).toBe("#abcdef");
    expect(ccodestr("123456")).toBe("#123456");
  });

  it("4桁色コードをRGBAに変換する", () => {
    expect(ccodestr("ff00")).toBe("rgba(255, 255, 0, 0)");
    expect(ccodestr("7772")).toBe("rgba(119, 119, 119, 0.13333333333333333)");
    expect(ccodestr("f05a")).toBe("rgba(255, 0, 85, 0.6666666666666666)");
    expect(ccodestr("0000")).toBe("rgba(0, 0, 0, 0)");
    expect(ccodestr("ffff")).toBe("rgba(255, 255, 255, 1)");
  });

  it("無効な値に対してnullを返す", () => {
    expect(ccodestr("xyz")).toBe(null);
    expect(ccodestr("")).toBe(null);
    expect(ccodestr("ff")).toBe(null);
    expect(ccodestr("ff00ff0")).toBe(null);
    expect(ccodestr("gg00")).toBe(null);
  });

  it("大文字小文字を区別しない", () => {
    expect(ccodestr("FF00")).toBe("rgba(255, 255, 0, 0)");
    expect(ccodestr("Ff0A")).toBe("rgba(255, 255, 0, 0.6666666666666666)");
    expect(ccodestr("ABC")).toBe("#ABC");
    expect(ccodestr("ABCDEF")).toBe("#ABCDEF");
  });

  it("文字列以外の値に対してnullを返す", () => {
    expect(ccodestr(123 as any)).toBe(null);
    expect(ccodestr(true as any)).toBe(null);
    expect(ccodestr(null as any)).toBe(null);
    expect(ccodestr(undefined as any)).toBe(null);
  });
});
