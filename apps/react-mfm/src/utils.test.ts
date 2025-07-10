import { describe, expect, it } from "vitest";
import { nyaize, toUrl } from "./utils";

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

  describe("nyaize", () => {
    it('replaces "na" with "nya"', () => {
      expect(nyaize("banana")).toBe("banyanya");
    });

    it('replaces "na" case-insensitively', () => {
      expect(nyaize("National")).toBe("Nyationyal");
    });

    it("replaces multiple occurrences", () => {
      expect(nyaize("banana and mango")).toBe("banyanya and mango");
    });

    it('handles text without "na"', () => {
      expect(nyaize("hello world")).toBe("hello world");
    });

    it("handles empty string", () => {
      expect(nyaize("")).toBe("");
    });

    it('handles "na" at the beginning', () => {
      expect(nyaize("name")).toBe("nyame");
    });

    it('handles "na" at the end', () => {
      expect(nyaize("gonna")).toBe("gonnya");
    });
  });
});
