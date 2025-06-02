import { APIClient } from "misskey-js/api.js";
import type { User } from "misskey-js/entities.js";
import { $Enums, type ServerSession, type ServerInfo } from "~/generated/prisma";
import type { CreateServerSessionInput } from "../validators/server-sessions.validator";
import { HTTPException } from "hono/http-exception";
import { ServerSessionsRepository } from "../repositories/server-sessions.repository"; // リポジトリをインポート

export class ServerSessionsService {
  private repository: ServerSessionsRepository;

  constructor() {
    this.repository = new ServerSessionsRepository(); // リポジトリをインスタンス化
  }

  async create(
    data: CreateServerSessionInput,
    userId: string,
  ): Promise<ServerSession> {
    const serverType =
      data.serverType.toLowerCase() === "misskey"
        ? $Enums.ServerType.Misskey
        : $Enums.ServerType.OtherServer;

    let fetchMisskeyResult: { ok: boolean; token: string; user: User };
    try {
      const response = await fetch(
        `${data.origin}/api/miauth/${data.sessionToken}/check`,
        {
          method: "POST",
          headers: {
            "Content-Length": "0",
          },
        },
      );
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Misskey auth check failed with status ${response.status}: ${errorBody}`);
        throw new HTTPException(401, { message: `Cannot authenticate with Misskey server: Status ${response.status}` });
      }
      fetchMisskeyResult = await response.json();
    } catch (err) {
      console.error("Error during Misskey auth check:", err);
      if (err instanceof HTTPException) throw err;
      throw new HTTPException(500, { message: "Failed to connect to Misskey server for authentication" });
    }

    if (!fetchMisskeyResult || fetchMisskeyResult.ok === false) {
      throw new HTTPException(401, {
        message: "Cannot authenticate with Misskey server",
      });
    }

    const newServerSession = await this.repository.createServerSession({ // リポジトリメソッドを使用
      origin: data.origin,
      serverType: serverType,
      serverToken: fetchMisskeyResult.token,
      userId: userId,
    });

    await this.updateOrCreateServerInfo(
      newServerSession.id,
      data.origin,
      userId,
    );
    return newServerSession;
  }

  async getList(userId: string): Promise<ServerSession[]> {
    return await this.repository.findServerSessionsByUserId(userId); // リポジトリメソッドを使用
  }

  async getServerSessionFromId(id: string): Promise<ServerSession | null> {
    const server = await this.repository.findServerSessionById(id); // リポジトリメソッドを使用
    if (!server) {
      throw new HTTPException(404, { message: `Server session with ID ${id} not found` });
    }
    return server;
  }

  async getServerSessionFromUserIdAndOrigin(
    userId: string,
    origin: string,
  ): Promise<ServerSession | null> {
    const server = await this.repository.findServerSessionByUserIdAndOrigin( // リポジトリメソッドを使用
      userId,
      origin,
    );
    if (!server) {
      throw new HTTPException(404, {
        message: `Server session for user ${userId} and origin ${origin} not found`,
      });
    }
    return server;
  }

  async updateOrCreateServerInfo(
    serverSessionId: string,
    origin: string,
    userId: string,
  ): Promise<ServerInfo> {
    const serverSessionData = await this.repository.findServerSessionToken( // リポジトリメソッドを使用
      userId,
      origin,
    );

    if (!serverSessionData?.serverToken) {
      throw new HTTPException(404, {
        message: `Server session token not found for user ${userId} and origin ${origin}`,
      });
    }

    const client = new APIClient({
      origin: origin,
      credential: serverSessionData.serverToken,
    });

    let misskeyServerInfo;
    try {
      misskeyServerInfo = await client.request("meta", { detail: true });
    } catch (err) {
      console.error("Error fetching Misskey server meta:", err);
      throw new HTTPException(500, { message: "Cannot get server info from Misskey (meta)" });
    }

    let misskeyUserInfo;
    try {
      misskeyUserInfo = await client.request("i", {});
    } catch (err) {
      console.error("Error fetching Misskey user info (i):", err);
      throw new HTTPException(500, {
        message: "Cannot get user info from Misskey server (i)",
      });
    }

    const serverInfoData = {
      name: misskeyServerInfo.name || "",
      iconUrl: misskeyUserInfo.avatarUrl || "",
      faviconUrl: misskeyServerInfo.iconUrl || "",
      themeColor: misskeyServerInfo.themeColor || "",
      // serverSessionId は upsertServerInfo の中で自動的に関連付けられるか、
      // もしくはリポジトリメソッドの引数として渡す必要がない (where条件で使うため)
      // Prisma の upsert では create 時に serverSessionId が必要なので、
      // Omit で除外したものを渡すリポジトリのシグネチャに合わせています。
    };
    
    const serverInfoDb = await this.repository.upsertServerInfo( // リポジトリメソッドを使用
      serverSessionId,
      serverInfoData,
    );

    return serverInfoDb;
  }
}
