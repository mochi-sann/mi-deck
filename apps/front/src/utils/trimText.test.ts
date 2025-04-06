import { describe, expect, it } from "vitest";
import { trimFirstAndLastChar } from "./trimText"; // パスは実際のファイル構造に合わせてください

describe("trimFirstAndLastChar", () => {
  it("should remove the first and last characters from a string", () => {
    expect(trimFirstAndLastChar("abcde")).toBe("bcd");
  });

  it("should return an empty string if the input string has less than 3 characters", () => {
    expect(trimFirstAndLastChar("ab")).toBe("");
    expect(trimFirstAndLastChar("a")).toBe("");
    expect(trimFirstAndLastChar("")).toBe("");
  });

  it("should handle strings with spaces", () => {
    expect(trimFirstAndLastChar(" test ")).toBe("test");
  });
});
