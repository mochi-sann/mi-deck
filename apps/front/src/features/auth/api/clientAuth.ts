import * as Misskey from "misskey-js";
import { EnvironmentConfig } from "@/lib/config/environment";
import { storageManager } from "@/lib/storage";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { AuthErrorType, type MisskeyAuthResponse } from "../types";

export interface MiAuthOptions {
  appName: string;
  appDescription?: string;
  permissions: typeof Misskey.permissions;
}

export interface MiAuthResult {
  success: boolean;
  server?: MisskeyServerConnection;
  error?: string;
}

export interface ManualAuthResult {
  success: boolean;
  server?: MisskeyServerConnection;
  error?: string;
}
export type PeendingAuthType = {
  uuid: string;
  origin: string;
  timestamp: number;
  options: {
    appName: string;
    appDescription?: string;
    permissions: typeof Misskey.permissions;
  };
};
export const PENDING_AUTH_KEY_PREFIX = "miauth-pending-local" as const;

class ClientAuthManager {
  private defaultAuthOptions: MiAuthOptions = {
    appName: "mi-deck",
    appDescription: "Misskey Timeline Deck Client",
    permissions: Misskey.permissions,
  };

  private getProtocolFromOrigin(origin: string): "http" | "https" {
    if (!origin || typeof origin !== "string") {
      return "https"; // フォールバック
    }

    // 入力にプロトコルが明示的に指定されている場合はそれを尊重
    if (origin.startsWith("http://")) {
      return "http";
    }
    if (origin.startsWith("https://")) {
      return "https";
    }

    const domain = origin.replace(/^https?:\/\//, "");

    // ローカルアドレス判定（IPv4、IPv6、localhost）
    const isLocalAddress =
      domain.startsWith("localhost") ||
      domain.startsWith("127.0.0.1") ||
      domain.startsWith("::1") ||
      domain === "::1" ||
      domain.startsWith("[::1]"); // IPv6ブラケット記法対応

    // 環境変数でローカルHTTPが有効化されている場合のみHTTPを使用
    if (isLocalAddress && EnvironmentConfig.isLocalHttpEnabled()) {
      return "http";
    }

    return "https";
  }

  private buildOriginUrl(origin: string): string {
    if (!origin || typeof origin !== "string") {
      return "https://"; // フォールバック
    }

    // プロトコル判定（元の入力をそのまま渡すことで明示的なプロトコルを検出できる）
    const protocol = this.getProtocolFromOrigin(origin);
    const cleanOrigin = origin.replace(/^https?:\/\//, "");

    return `${protocol}://${cleanOrigin}`;
  }

  /**
   * ユーザー入力からプロトコルプレフィックスを除去し、クリーンなオリジンを返す
   * サーバー登録フォームなどで使用
   */
  public cleanOriginInput(input: string): string {
    if (!input || typeof input !== "string") {
      return "";
    }

    // 前後の空白を除去
    const trimmed = input.trim();
    if (!trimmed) {
      return "";
    }

    // 末尾のスラッシュを除去 (プロトコルは保持する)
    return trimmed.replace(/\/$/, "");
  }

  private generateMiAuthUrl(
    origin: string,
    options?: Partial<MiAuthOptions>,
  ): { url: string; uuid: string } {
    const authOptions = { ...this.defaultAuthOptions, ...options };
    const currentOrigin = window.location.origin;
    const uuid = crypto.randomUUID();

    const callbackUrl = `${currentOrigin}/callback/${encodeURIComponent(origin)}`;
    const originUrl = this.buildOriginUrl(origin);
    const miAuthUrl = `${originUrl}/miauth/${uuid}?name=${encodeURIComponent(authOptions.appName)}&permission=${authOptions.permissions.join(",")}&callback=${encodeURIComponent(callbackUrl)}`;

    if (authOptions.appDescription) {
      // MiAuth doesn't support description in URL, but we can store it for later use
    }

    return { url: miAuthUrl, uuid };
  }

  async initiateAuth(
    origin: string,
    options?: Partial<MiAuthOptions>,
  ): Promise<string> {
    try {
      await storageManager.initialize();

      const { url, uuid } = this.generateMiAuthUrl(origin, options);

      // Store pending auth session
      const pendingAuth: PeendingAuthType = {
        uuid,
        origin,
        timestamp: Date.now(),
        options: { ...this.defaultAuthOptions, ...options },
      };

      localStorage.setItem(
        PENDING_AUTH_KEY_PREFIX,
        JSON.stringify(pendingAuth),
      );

      // Open auth window
      const authWindow = window.open(
        url,
        "_self",
        "width=600,height=700,scrollbars=yes,resizable=yes",
      );

      if (!authWindow) {
        throw new Error(
          "Failed to open authentication window. Please check popup blocker settings.",
        );
      }

      return uuid;
    } catch (error) {
      throw error;
    }
  }

  private async validateAndSaveServer(
    origin: string,
    token: string,
  ): Promise<MisskeyServerConnection> {
    const originUrl = this.buildOriginUrl(origin);
    const misskeyClient = new Misskey.api.APIClient({
      origin: originUrl,
      credential: token,
    });

    const [userInfo, serverInfo] = await Promise.all([
      misskeyClient.request("i", {
        detail: true, // Get detailed user info
      }),
      misskeyClient.request("meta", { detail: true }),
    ]);

    // Create server connection
    const serverConnection: Omit<
      MisskeyServerConnection,
      "id" | "createdAt" | "updatedAt"
    > = {
      origin: originUrl,
      accessToken: token,
      isActive: true,
      userInfo: {
        id: userInfo.id,
        username: userInfo.username,
        name: userInfo.name || userInfo.username,
        avatarUrl: userInfo.avatarUrl || undefined,
      },
      serverInfo: {
        name: serverInfo.name || origin,
        version: serverInfo.version || "unknown",
        description: serverInfo.description || undefined,
        iconUrl: serverInfo.iconUrl || undefined,
      },
    };

    // Save to storage
    return await storageManager.addServer(serverConnection);
  }

  async completeAuth(
    _uuid: string,
    sessionToken: string,
  ): Promise<MiAuthResult> {
    try {
      await storageManager.initialize();

      // Retrieve pending auth session
      const pendingAuthData = localStorage.getItem(PENDING_AUTH_KEY_PREFIX);

      if (!pendingAuthData) {
        return { success: false, error: "Auth session not found or expired" };
      }

      const pendingAuth: PeendingAuthType = JSON.parse(pendingAuthData);

      const fetchMisskey: MisskeyAuthResponse = await fetch(
        `${this.buildOriginUrl(pendingAuth.origin)}/api/miauth/${sessionToken}/check`,
        {
          method: "POST",
          headers: {
            "Content-Length": "0",
          },
        },
      )
        .then((res) => res.json())
        .catch((err) => {
          const errorInfo = this.classifyError(err);
          return {
            ok: false,
            error: errorInfo.message,
          } as MisskeyAuthResponse;
        });

      if (!fetchMisskey || fetchMisskey.ok === false) {
        const errorMessage =
          fetchMisskey?.error || "Cannot authenticate with Misskey server";
        throw new Error(errorMessage);
      }

      // 型安全性のチェック
      if (!fetchMisskey.token) {
        throw new Error("Authentication token not received from server");
      }

      const origin = pendingAuth.origin;

      const savedServer = await this.validateAndSaveServer(
        origin,
        fetchMisskey.token,
      );

      // Clean up pending auth
      localStorage.removeItem(PENDING_AUTH_KEY_PREFIX);

      return { success: true, server: savedServer };
    } catch (error) {
      // Clean up pending auth on error
      localStorage.removeItem(PENDING_AUTH_KEY_PREFIX);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }

  async addServerWithToken(
    origin: string,
    token: string,
  ): Promise<ManualAuthResult> {
    try {
      await storageManager.initialize();

      const savedServer = await this.validateAndSaveServer(origin, token);

      return { success: true, server: savedServer };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }

  async refreshServerInfo(serverId: string): Promise<void> {
    try {
      await storageManager.initialize();

      const server = await storageManager.getServer(serverId);
      if (!server || !server.accessToken) {
        throw new Error("Server not found or no access token");
      }

      const misskeyClient = new Misskey.api.APIClient({
        origin: server.origin,
        credential: server.accessToken,
      });

      const [userInfo, serverInfo] = await Promise.all([
        misskeyClient.request("i", {}),
        misskeyClient.request("meta", { detail: false }),
      ]);

      await storageManager.updateServer(serverId, {
        userInfo: {
          id: userInfo.id,
          username: userInfo.username,
          name: userInfo.name || userInfo.username,
          avatarUrl: userInfo.avatarUrl || undefined,
        },
        serverInfo: {
          name: serverInfo.name || server.origin,
          version: serverInfo.version || "unknown",
          description: serverInfo.description || undefined,
          iconUrl: serverInfo.iconUrl || undefined,
        },
      });
    } catch (error) {
      console.error("Failed to refresh server info:", error);
      throw error;
    }
  }

  async validateToken(serverId: string): Promise<boolean> {
    try {
      await storageManager.initialize();

      const server = await storageManager.getServer(serverId);
      if (!server || !server.accessToken) {
        return false;
      }

      const misskeyClient = new Misskey.api.APIClient({
        origin: server.origin,
        credential: server.accessToken,
      });

      await misskeyClient.request("i", {});
      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  }

  async removeServerAuth(serverId: string): Promise<void> {
    try {
      await storageManager.initialize();
      await storageManager.deleteServer(serverId);
    } catch (error) {
      console.error("Failed to remove server auth:", error);
      throw error;
    }
  }

  // Clean up expired pending auth sessions
  cleanupExpiredSessions(): void {
    const now = Date.now();
    const expireTime = 30 * 60 * 1000; // 30 minutes

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("miauth-pending-")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          if (now - data.timestamp > expireTime) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  }

  private classifyError(error: Error): {
    type: AuthErrorType;
    message: string;
  } {
    // ネットワークエラーの判定
    if (
      error.message.includes("fetch") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("network")
    ) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: "Network error occurred",
      };
    }

    // CORS エラーの判定
    if (
      error.message.includes("cors") ||
      error.message.includes("cross-origin")
    ) {
      return { type: AuthErrorType.CORS_ERROR, message: "CORS error occurred" };
    }

    // タイムアウトエラーの判定
    if (error.message.includes("timeout")) {
      return {
        type: AuthErrorType.TIMEOUT_ERROR,
        message: "Request timed out",
      };
    }

    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: "Unknown error occurred",
    };
  }
}

export const clientAuthManager = new ClientAuthManager();
