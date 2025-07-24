import { describe, expect, it } from "vitest";
import { clientAuthManager } from "./clientAuth";

describe("ClientAuthManager", () => {
  describe("getProtocolFromOrigin", () => {
    // プライベートメソッドをテストするため、型アサーションを使用
    const manager = clientAuthManager as any;

    it("should return http for localhost", () => {
      expect(manager.getProtocolFromOrigin("localhost")).toBe("http");
      expect(manager.getProtocolFromOrigin("localhost:3002")).toBe("http");
      expect(manager.getProtocolFromOrigin("localhost:8080")).toBe("http");
    });

    it("should return http for 127.0.0.1", () => {
      expect(manager.getProtocolFromOrigin("127.0.0.1")).toBe("http");
      expect(manager.getProtocolFromOrigin("127.0.0.1:3002")).toBe("http");
      expect(manager.getProtocolFromOrigin("127.0.0.1:8080")).toBe("http");
    });

    it("should return http for IPv6 localhost (::1)", () => {
      expect(manager.getProtocolFromOrigin("::1")).toBe("http");
      expect(manager.getProtocolFromOrigin("[::1]:3002")).toBe("http");
      expect(manager.getProtocolFromOrigin("[::1]")).toBe("http");
    });

    it("should return https for other domains", () => {
      expect(manager.getProtocolFromOrigin("example.com")).toBe("https");
      expect(manager.getProtocolFromOrigin("misskey.io")).toBe("https");
      expect(manager.getProtocolFromOrigin("test.example.org")).toBe("https");
      expect(manager.getProtocolFromOrigin("192.168.1.1")).toBe("https");
    });

    it("should handle protocol prefixes correctly", () => {
      expect(manager.getProtocolFromOrigin("https://localhost:3002")).toBe(
        "http",
      );
      expect(manager.getProtocolFromOrigin("http://localhost:3002")).toBe(
        "http",
      );
      expect(manager.getProtocolFromOrigin("https://example.com")).toBe(
        "https",
      );
      expect(manager.getProtocolFromOrigin("http://example.com")).toBe("https");
    });

    it("should return https for invalid input (error handling)", () => {
      expect(manager.getProtocolFromOrigin("")).toBe("https");
      expect(manager.getProtocolFromOrigin(null)).toBe("https");
      expect(manager.getProtocolFromOrigin(undefined)).toBe("https");
      expect(manager.getProtocolFromOrigin(123 as any)).toBe("https");
    });
  });

  describe("buildOriginUrl", () => {
    const manager = clientAuthManager as any;

    it("should build http URLs for local addresses", () => {
      expect(manager.buildOriginUrl("localhost:3002")).toBe(
        "http://localhost:3002",
      );
      expect(manager.buildOriginUrl("127.0.0.1:3002")).toBe(
        "http://127.0.0.1:3002",
      );
      expect(manager.buildOriginUrl("::1")).toBe("http://::1");
    });

    it("should build https URLs for remote addresses", () => {
      expect(manager.buildOriginUrl("example.com")).toBe("https://example.com");
      expect(manager.buildOriginUrl("misskey.io")).toBe("https://misskey.io");
    });

    it("should handle existing protocol prefixes", () => {
      expect(manager.buildOriginUrl("https://localhost:3002")).toBe(
        "http://localhost:3002",
      );
      expect(manager.buildOriginUrl("http://localhost:3002")).toBe(
        "http://localhost:3002",
      );
      expect(manager.buildOriginUrl("https://example.com")).toBe(
        "https://example.com",
      );
      expect(manager.buildOriginUrl("http://example.com")).toBe(
        "https://example.com",
      );
    });

    it("should return https URL for invalid input", () => {
      expect(manager.buildOriginUrl("")).toBe("https://");
      expect(manager.buildOriginUrl(null)).toBe("https://");
      expect(manager.buildOriginUrl(undefined)).toBe("https://");
    });
  });

  describe("cleanOriginInput", () => {
    const manager = clientAuthManager as any;

    it("should clean basic domain input", () => {
      expect(manager.cleanOriginInput("misskey.io")).toBe("misskey.io");
      expect(manager.cleanOriginInput("localhost:3002")).toBe("localhost:3002");
      expect(manager.cleanOriginInput("example.com")).toBe("example.com");
    });

    it("should remove http/https prefixes", () => {
      expect(manager.cleanOriginInput("https://misskey.io")).toBe("misskey.io");
      expect(manager.cleanOriginInput("http://localhost:3002")).toBe(
        "localhost:3002",
      );
      expect(manager.cleanOriginInput("https://example.com/")).toBe(
        "example.com",
      );
    });

    it("should trim whitespace and remove trailing slashes", () => {
      expect(manager.cleanOriginInput("  misskey.io  ")).toBe("misskey.io");
      expect(manager.cleanOriginInput("misskey.io/")).toBe("misskey.io");
      expect(manager.cleanOriginInput("  https://misskey.io/  ")).toBe(
        "misskey.io",
      );
    });

    it("should handle complex cases", () => {
      expect(manager.cleanOriginInput("https://misskey.example.com:443/")).toBe(
        "misskey.example.com:443",
      );
      expect(manager.cleanOriginInput("http://127.0.0.1:3000/")).toBe(
        "127.0.0.1:3000",
      );
    });

    it("should handle invalid input gracefully", () => {
      expect(manager.cleanOriginInput("")).toBe("");
      expect(manager.cleanOriginInput("   ")).toBe("");
      expect(manager.cleanOriginInput(null as any)).toBe("");
      expect(manager.cleanOriginInput(undefined as any)).toBe("");
      expect(manager.cleanOriginInput(123 as any)).toBe("");
    });
  });
});
