import type {
  ClientAuthState,
  MisskeyServerConnection,
  TimelineConfig,
} from "./types";

const STORAGE_KEYS = {
  servers: "mi-deck-servers",
  timelines: "mi-deck-timelines",
  authState: "mi-deck-auth-state",
} as const;

class LocalStorageManager {
  private getStoredData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStoredData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  // Server management
  async addServer(
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ): Promise<MisskeyServerConnection> {
    const servers = this.getStoredData<MisskeyServerConnection>(
      STORAGE_KEYS.servers,
    );
    const now = new Date();
    const newServer: MisskeyServerConnection = {
      ...server,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    servers.push(newServer);
    this.setStoredData(STORAGE_KEYS.servers, servers);
    return newServer;
  }

  async getServer(id: string): Promise<MisskeyServerConnection | undefined> {
    const servers = this.getStoredData<MisskeyServerConnection>(
      STORAGE_KEYS.servers,
    );
    return servers.find((s) => s.id === id);
  }

  async getAllServers(): Promise<MisskeyServerConnection[]> {
    return this.getStoredData<MisskeyServerConnection>(STORAGE_KEYS.servers);
  }

  async updateServer(
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ): Promise<void> {
    const servers = this.getStoredData<MisskeyServerConnection>(
      STORAGE_KEYS.servers,
    );
    const index = servers.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error(`Server with id ${id} not found`);
    }

    servers[index] = {
      ...servers[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.setStoredData(STORAGE_KEYS.servers, servers);
  }

  async deleteServer(id: string): Promise<void> {
    const servers = this.getStoredData<MisskeyServerConnection>(
      STORAGE_KEYS.servers,
    );
    const filteredServers = servers.filter((s) => s.id !== id);
    this.setStoredData(STORAGE_KEYS.servers, filteredServers);

    // Delete associated timelines
    const timelines = this.getStoredData<TimelineConfig>(
      STORAGE_KEYS.timelines,
    );
    const filteredTimelines = timelines.filter((t) => t.serverId !== id);
    this.setStoredData(STORAGE_KEYS.timelines, filteredTimelines);
  }

  // Timeline management
  async addTimeline(
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ): Promise<TimelineConfig> {
    const timelines = this.getStoredData<TimelineConfig>(
      STORAGE_KEYS.timelines,
    );
    const now = new Date();
    const newTimeline: TimelineConfig = {
      ...timeline,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    timelines.push(newTimeline);
    this.setStoredData(STORAGE_KEYS.timelines, timelines);
    return newTimeline;
  }

  async getTimeline(id: string): Promise<TimelineConfig | undefined> {
    const timelines = this.getStoredData<TimelineConfig>(
      STORAGE_KEYS.timelines,
    );
    return timelines.find((t) => t.id === id);
  }

  async getTimelinesByServer(serverId: string): Promise<TimelineConfig[]> {
    const timelines = this.getStoredData<TimelineConfig>(
      STORAGE_KEYS.timelines,
    );
    return timelines.filter((t) => t.serverId === serverId);
  }

  async getAllTimelines(): Promise<TimelineConfig[]> {
    return this.getStoredData<TimelineConfig>(STORAGE_KEYS.timelines);
  }

  async updateTimeline(
    id: string,
    updates: Partial<TimelineConfig>,
  ): Promise<void> {
    const timelines = this.getStoredData<TimelineConfig>(
      STORAGE_KEYS.timelines,
    );
    const index = timelines.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error(`Timeline with id ${id} not found`);
    }

    timelines[index] = {
      ...timelines[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.setStoredData(STORAGE_KEYS.timelines, timelines);
  }

  async deleteTimeline(id: string): Promise<void> {
    const timelines = this.getStoredData<TimelineConfig>(
      STORAGE_KEYS.timelines,
    );
    const filteredTimelines = timelines.filter((t) => t.id !== id);
    this.setStoredData(STORAGE_KEYS.timelines, filteredTimelines);
  }

  async reorderTimelines(timelineIds: string[]): Promise<void> {
    const timelines = this.getStoredData<TimelineConfig>(
      STORAGE_KEYS.timelines,
    );

    timelineIds.forEach((id, index) => {
      const timeline = timelines.find((t) => t.id === id);
      if (timeline) {
        timeline.order = index;
        timeline.updatedAt = new Date();
      }
    });

    this.setStoredData(STORAGE_KEYS.timelines, timelines);
  }

  // Auth state management
  async getAuthState(): Promise<ClientAuthState | undefined> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.authState);
      return data ? JSON.parse(data) : undefined;
    } catch {
      return undefined;
    }
  }

  async setAuthState(state: ClientAuthState): Promise<void> {
    try {
      const stateWithTimestamp = { ...state, lastUpdated: new Date() };
      localStorage.setItem(
        STORAGE_KEYS.authState,
        JSON.stringify(stateWithTimestamp),
      );
    } catch (error) {
      console.error("Failed to save auth state:", error);
    }
  }

  async clearAuthState(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.authState);
    } catch (error) {
      console.error("Failed to clear auth state:", error);
    }
  }
}

export const localStorageManager = new LocalStorageManager();
