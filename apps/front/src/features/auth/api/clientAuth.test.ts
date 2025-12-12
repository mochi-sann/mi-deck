import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EnvironmentConfig } from "@/lib/config/environment";
import { clientAuthManager } from "./clientAuth";

describe("ClientAuthManager", () => {
  // 環境変数制御なしのレガシーテスト（環境変数未設定時の動作をテスト）
  describe("getProtocolFromOrigin (環境変数制御なし)", () => {
    // プライベートメソッドをテストするため、型アサーションを使用

    const manager = clientAuthManager as any;

    beforeEach(() => {
      // テスト前にキャッシュをリセット
      EnvironmentConfig._resetCache();
      // 環境変数を未設定にする
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", undefined);
    });

    afterEach(() => {
      // テスト後に環境変数をクリーンアップ
      vi.unstubAllEnvs();
    });

    it("should return https for localhost (環境変数未設定)", () => {
      expect(manager.getProtocolFromOrigin("localhost")).toBe("https");
      expect(manager.getProtocolFromOrigin("localhost:3002")).toBe("https");
      expect(manager.getProtocolFromOrigin("localhost:8080")).toBe("https");
    });

    it("should return https for 127.0.0.1 (環境変数未設定)", () => {
      expect(manager.getProtocolFromOrigin("127.0.0.1")).toBe("https");
      expect(manager.getProtocolFromOrigin("127.0.0.1:3002")).toBe("https");
      expect(manager.getProtocolFromOrigin("127.0.0.1:8080")).toBe("https");
    });

    it("should return https for IPv6 localhost (::1) (環境変数未設定)", () => {
      expect(manager.getProtocolFromOrigin("::1")).toBe("https");
      expect(manager.getProtocolFromOrigin("[::1]:3002")).toBe("https");
      expect(manager.getProtocolFromOrigin("[::1]")).toBe("https");
    });

    it("should return https for other domains", () => {
      expect(manager.getProtocolFromOrigin("example.com")).toBe("https");
      expect(manager.getProtocolFromOrigin("misskey.io")).toBe("https");
      expect(manager.getProtocolFromOrigin("test.example.org")).toBe("https");
      expect(manager.getProtocolFromOrigin("192.168.1.1")).toBe("https");
    });

    it("should handle protocol prefixes correctly (環境変数未設定)", () => {
      expect(manager.getProtocolFromOrigin("https://localhost:3002")).toBe(
        "https",
      );
      // 明示的なhttpは尊重されるべき
      expect(manager.getProtocolFromOrigin("http://localhost:3002")).toBe(
        "http",
      );
      expect(manager.getProtocolFromOrigin("https://example.com")).toBe(
        "https",
      );
      // 明示的なhttpは尊重されるべき
      expect(manager.getProtocolFromOrigin("http://example.com")).toBe("http");
    });

    it("should return https for invalid input (error handling)", () => {
      expect(manager.getProtocolFromOrigin("")).toBe("https");
      expect(manager.getProtocolFromOrigin(null)).toBe("https");
      expect(manager.getProtocolFromOrigin(undefined)).toBe("https");

      expect(manager.getProtocolFromOrigin(123 as any)).toBe("https");
    });
  });

  describe("buildOriginUrl (環境変数制御なし)", () => {
    const manager = clientAuthManager as any;

    beforeEach(() => {
      // テスト前にキャッシュをリセット
      EnvironmentConfig._resetCache();
      // 環境変数を未設定にする
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", undefined);
    });

    afterEach(() => {
      // テスト後に環境変数をクリーンアップ
      vi.unstubAllEnvs();
    });

    it("should build https URLs for local addresses (環境変数未設定)", () => {
      expect(manager.buildOriginUrl("localhost:3002")).toBe(
        "https://localhost:3002",
      );
      expect(manager.buildOriginUrl("127.0.0.1:3002")).toBe(
        "https://127.0.0.1:3002",
      );
      expect(manager.buildOriginUrl("::1")).toBe("https://::1");
    });

    it("should build https URLs for remote addresses", () => {
      expect(manager.buildOriginUrl("example.com")).toBe("https://example.com");
      expect(manager.buildOriginUrl("misskey.io")).toBe("https://misskey.io");
    });

    it("should handle existing protocol prefixes (環境変数未設定)", () => {
      expect(manager.buildOriginUrl("https://localhost:3002")).toBe(
        "https://localhost:3002",
      );
      // httpが明示されている場合はhttpになる
      expect(manager.buildOriginUrl("http://localhost:3002")).toBe(
        "http://localhost:3002",
      );
      expect(manager.buildOriginUrl("https://example.com")).toBe(
        "https://example.com",
      );
      // httpが明示されている場合はhttpになる
      expect(manager.buildOriginUrl("http://example.com")).toBe(
        "http://example.com",
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

    it("should NOT remove http/https prefixes anymore", () => {
      expect(manager.cleanOriginInput("https://misskey.io")).toBe(
        "https://misskey.io",
      );
      expect(manager.cleanOriginInput("http://localhost:3002")).toBe(
        "http://localhost:3002",
      );
      expect(manager.cleanOriginInput("https://example.com/")).toBe(
        "https://example.com",
      );
    });

    it("should trim whitespace and remove trailing slashes", () => {
      expect(manager.cleanOriginInput("  misskey.io  ")).toBe("misskey.io");
      expect(manager.cleanOriginInput("misskey.io/")).toBe("misskey.io");
      expect(manager.cleanOriginInput("  https://misskey.io/  ")).toBe(
        "https://misskey.io",
      );
    });

    it("should handle complex cases", () => {
      expect(manager.cleanOriginInput("https://misskey.example.com:443/")).toBe(
        "https://misskey.example.com:443",
      );
      expect(manager.cleanOriginInput("http://127.0.0.1:3000/")).toBe(
        "http://127.0.0.1:3000",
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

  describe("buildOriginUrl with environment control", () => {
    const manager = clientAuthManager as any;

    beforeEach(() => {
      EnvironmentConfig._resetCache();
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should build http URLs for local addresses when env var is true", () => {
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "true");

      expect(manager.buildOriginUrl("localhost:3002")).toBe(
        "http://localhost:3002",
      );
      expect(manager.buildOriginUrl("127.0.0.1:3002")).toBe(
        "http://127.0.0.1:3002",
      );
      expect(manager.buildOriginUrl("::1")).toBe("http://::1");
    });

    it("should build https URLs for remote addresses when env var is true", () => {
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "true");

      expect(manager.buildOriginUrl("example.com")).toBe("https://example.com");
      expect(manager.buildOriginUrl("misskey.io")).toBe("https://misskey.io");
    });
  });

  describe("環境変数制御によるプロトコル判定", () => {
    beforeEach(() => {
      // テスト前にキャッシュをリセット
      EnvironmentConfig._resetCache();
    });

    afterEach(() => {
      // テスト後に環境変数をクリーンアップ
      vi.unstubAllEnvs();
    });

    it("環境変数未設定時はローカルアドレスでもHTTPS", () => {
      // 環境変数を未設定にする
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", undefined);

      const manager = new (clientAuthManager.constructor as any)();
      expect(manager.getProtocolFromOrigin("localhost")).toBe("https");
      expect(manager.getProtocolFromOrigin("127.0.0.1")).toBe("https");
      expect(manager.getProtocolFromOrigin("::1")).toBe("https");
    });

    it("環境変数=true時はローカルアドレスでHTTP", () => {
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "true");

      const manager = new (clientAuthManager.constructor as any)();
      expect(manager.getProtocolFromOrigin("localhost")).toBe("http");
      expect(manager.getProtocolFromOrigin("127.0.0.1")).toBe("http");
      expect(manager.getProtocolFromOrigin("::1")).toBe("http");
      expect(manager.getProtocolFromOrigin("[::1]")).toBe("http");
    });

    it("環境変数=false時はローカルアドレスでもHTTPS", () => {
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "false");

      const manager = new (clientAuthManager.constructor as any)();
      expect(manager.getProtocolFromOrigin("localhost")).toBe("https");
      expect(manager.getProtocolFromOrigin("127.0.0.1")).toBe("https");
    });

    it("環境変数が無効な値の場合はHTTPS", () => {
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "TRUE"); // 大文字は無効

      const manager = new (clientAuthManager.constructor as any)();
      expect(manager.getProtocolFromOrigin("localhost")).toBe("https");

      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "1"); // 数字は無効
      EnvironmentConfig._resetCache(); // キャッシュリセット
      expect(manager.getProtocolFromOrigin("localhost")).toBe("https");
    });

    it("リモートアドレスは環境変数に関係なくHTTPS", () => {
      vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "true");

      const manager = new (clientAuthManager.constructor as any)();
      expect(manager.getProtocolFromOrigin("example.com")).toBe("https");
      expect(manager.getProtocolFromOrigin("misskey.io")).toBe("https");
      expect(manager.getProtocolFromOrigin("192.168.1.100")).toBe("https");
    });
  });
});
