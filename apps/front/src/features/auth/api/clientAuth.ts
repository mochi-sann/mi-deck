import { storageManager } from "@/lib/storage";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import * as Misskey from "misskey-js";
import { User } from "misskey-js/entities.js";

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

  private generateMiAuthUrl(
    origin: string,
    options?: Partial<MiAuthOptions>,
  ): { url: string; uuid: string } {
    const authOptions = { ...this.defaultAuthOptions, ...options };
    const currentOrigin = window.location.origin;
    const uuid = crypto.randomUUID();

    const callbackUrl = `${currentOrigin}/callback/${encodeURIComponent(origin)}`;
    const miAuthUrl = `https://${origin}/miauth/${uuid}?name=${encodeURIComponent(authOptions.appName)}&permission=${authOptions.permissions.join(",")}&callback=${encodeURIComponent(callbackUrl)}`;

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
      console.error("Failed to initiate auth:", error);
      throw error;
    }
  }

  async completeAuth(
    uuid: string,
    sessionToken: string,
  ): Promise<MiAuthResult> {
    try {
      console.log("CompleteAuth called with:", { uuid, sessionToken });
      await storageManager.initialize();

      // Retrieve pending auth session
      const pendingAuthData = localStorage.getItem(PENDING_AUTH_KEY_PREFIX);
      console.log("Retrieved pending auth data:", pendingAuthData);

      if (!pendingAuthData) {
        return { success: false, error: "Auth session not found or expired" };
      }

      const pendingAuth: PeendingAuthType = JSON.parse(pendingAuthData);

      const fetchMisskey: {
        ok: boolean;
        token: string;
        user: User;
      } = await fetch(
        `https://${pendingAuth.origin}/api/miauth/${sessionToken}/check`,
        {
          method: "POST",
          headers: {
            "Content-Length": "0",
          },
        },
      )
        .then((res) => res.json())
        .catch((err) => {
          console.error(err);
          return new Error("can not auth misskey server");
        });

      if (!fetchMisskey || fetchMisskey.ok === false) {
        throw new Error("Cannot authenticate with Misskey server");
      }
      const origin = pendingAuth.origin;
      console.log("Using origin from pending auth:", origin);

      // Validate session token and get user info
      const misskeyClient = new Misskey.api.APIClient({
        origin: `https://${origin}`,
        credential: fetchMisskey.token,
      });

      console.log("Making API requests to validate token...");
      const [userInfo, serverInfo] = await Promise.all([
        misskeyClient.request("i", {
          detail: true, // Get detailed user info
        }),
        misskeyClient.request("meta", { detail: true }),
      ]);
      console.log("API requests successful:", { userInfo, serverInfo });

      // Create server connection
      const serverConnection: Omit<
        MisskeyServerConnection,
        "id" | "createdAt" | "updatedAt"
      > = {
        origin: `https://${origin}`,
        accessToken: fetchMisskey.token,
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
      const savedServer = await storageManager.addServer(serverConnection);

      // Clean up pending auth
      localStorage.removeItem(PENDING_AUTH_KEY_PREFIX);

      return { success: true, server: savedServer };
    } catch (error) {
      console.error("Failed to complete auth:", error);

      // Clean up pending auth on error
      localStorage.removeItem(PENDING_AUTH_KEY_PREFIX);

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
}

export const clientAuthManager = new ClientAuthManager();
