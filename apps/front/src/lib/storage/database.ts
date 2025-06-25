import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type {
  ClientAuthState,
  MisskeyServerConnection,
  TimelineConfig,
} from "./types";

interface MiDeckDb extends DBSchema {
  servers: {
    key: string;
    value: MisskeyServerConnection;
  };
  timelines: {
    key: string;
    value: TimelineConfig;
    indexes: { "by-server": string; "by-order": number };
  };
  auth: {
    key: "current";
    value: ClientAuthState;
  };
}

class DatabaseManager {
  private db: IDBPDatabase<MiDeckDb> | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB<MiDeckDb>("mi-deck", 1, {
      upgrade(db) {
        // Servers store
        if (!db.objectStoreNames.contains("servers")) {
          db.createObjectStore("servers", { keyPath: "id" });
        }

        // Timelines store
        if (!db.objectStoreNames.contains("timelines")) {
          const timelineStore = db.createObjectStore("timelines", {
            keyPath: "id",
          });
          timelineStore.createIndex("by-server", "serverId");
          timelineStore.createIndex("by-order", "order");
        }

        // Auth state store
        if (!db.objectStoreNames.contains("auth")) {
          db.createObjectStore("auth");
        }
      },
    });
  }

  private ensureDB(): IDBPDatabase<MiDeckDb> {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }

  // Server management
  async addServer(
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ): Promise<MisskeyServerConnection> {
    const db = this.ensureDB();
    const now = new Date();
    const newServer: MisskeyServerConnection = {
      ...server,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.put("servers", newServer);
    return newServer;
  }

  async getServer(id: string): Promise<MisskeyServerConnection | undefined> {
    const db = this.ensureDB();
    return await db.get("servers", id);
  }

  async getAllServers(): Promise<MisskeyServerConnection[]> {
    const db = this.ensureDB();
    return await db.getAll("servers");
  }

  async updateServer(
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ): Promise<void> {
    const db = this.ensureDB();
    const server = await db.get("servers", id);
    if (!server) {
      throw new Error(`Server with id ${id} not found`);
    }

    const updatedServer = {
      ...server,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put("servers", updatedServer);
  }

  async deleteServer(id: string): Promise<void> {
    const db = this.ensureDB();
    const tx = db.transaction(["servers", "timelines"], "readwrite");

    // Delete server
    await tx.objectStore("servers").delete(id);

    // Delete associated timelines
    const timelineIndex = tx.objectStore("timelines").index("by-server");
    const timelines = await timelineIndex.getAll(id);
    for (const timeline of timelines) {
      await tx.objectStore("timelines").delete(timeline.id);
    }

    await tx.done;
  }

  // Timeline management
  async addTimeline(
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ): Promise<TimelineConfig> {
    const db = this.ensureDB();
    const now = new Date();
    const newTimeline: TimelineConfig = {
      ...timeline,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.put("timelines", newTimeline);
    return newTimeline;
  }

  async getTimeline(id: string): Promise<TimelineConfig | undefined> {
    const db = this.ensureDB();
    return await db.get("timelines", id);
  }

  async getTimelinesByServer(serverId: string): Promise<TimelineConfig[]> {
    const db = this.ensureDB();
    const index = db.transaction("timelines").store.index("by-server");
    return await index.getAll(serverId);
  }

  async getAllTimelines(): Promise<TimelineConfig[]> {
    const db = this.ensureDB();
    return await db.getAll("timelines");
  }

  async updateTimeline(
    id: string,
    updates: Partial<TimelineConfig>,
  ): Promise<void> {
    const db = this.ensureDB();
    const timeline = await db.get("timelines", id);
    if (!timeline) {
      throw new Error(`Timeline with id ${id} not found`);
    }

    const updatedTimeline = {
      ...timeline,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put("timelines", updatedTimeline);
  }

  async deleteTimeline(id: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete("timelines", id);
  }

  async reorderTimelines(timelineIds: string[]): Promise<void> {
    const db = this.ensureDB();
    const tx = db.transaction("timelines", "readwrite");

    for (let i = 0; i < timelineIds.length; i++) {
      const timeline = await tx.store.get(timelineIds[i]);
      if (timeline) {
        timeline.order = i;
        timeline.updatedAt = new Date();
        await tx.store.put(timeline);
      }
    }

    await tx.done;
  }

  // Auth state management
  async getAuthState(): Promise<ClientAuthState | undefined> {
    const db = this.ensureDB();
    return await db.get("auth", "current");
  }

  async setAuthState(state: ClientAuthState): Promise<void> {
    const db = this.ensureDB();
    await db.put("auth", { ...state, lastUpdated: new Date() }, "current");
  }

  async clearAuthState(): Promise<void> {
    const db = this.ensureDB();
    await db.delete("auth", "current");
  }
}

export const databaseManager = new DatabaseManager();
