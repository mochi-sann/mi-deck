import { describe, expect, it } from "vitest";
import { toUrl, unixTimeToDate } from "./utils";

describe("utils", () => {
  describe("toUrl", () => {
    it("adds https protocol to plain host", () => {
      expect(toUrl("example.com")).toBe("https://example.com");
    });

    it("keeps existing protocol", () => {
      expect(toUrl("http://example.com")).toBe("http://example.com");
      expect(toUrl("https://example.com")).toBe("https://example.com");
    });

    it("handles localhost", () => {
      expect(toUrl("localhost:3000")).toBe("https://localhost:3000");
    });

    it("handles IP addresses", () => {
      expect(toUrl("192.168.1.1")).toBe("https://192.168.1.1");
    });
  });

  describe("unixTimeToDate", () => {
    it("parses second-based integer strings", () => {
      const result = unixTimeToDate("1700000000");
      expect(result).not.toBeNull();
      expect(result?.getTime()).toBe(1_700_000_000 * 1000);
    });

    it("handles millisecond integers without scaling", () => {
      const timestamp = 1_700_000_000_000;
      const result = unixTimeToDate(timestamp);
      expect(result).not.toBeNull();
      expect(result?.getTime()).toBe(timestamp);
    });

    it("returns null for non-integer strings", () => {
      expect(unixTimeToDate("not-a-number")).toBeNull();
      expect(unixTimeToDate("12.5")).toBeNull();
    });
  });
});
