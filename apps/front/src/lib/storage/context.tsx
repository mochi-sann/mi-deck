import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { storageManager } from "./index";
import type {
  ClientAuthState,
  MisskeyServerConnection,
  TimelineConfig,
} from "./types";

interface StorageContextValue {
  // State
  servers: MisskeyServerConnection[];
  timelines: TimelineConfig[];
  currentServerId?: string;
  isLoading: boolean;
  error?: string;

  // Server operations
  addServer: (
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ) => Promise<MisskeyServerConnection>;
  updateServer: (
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
  setCurrentServer: (serverId?: string) => Promise<void>;

  // Timeline operations
  addTimeline: (
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ) => Promise<TimelineConfig>;
  updateTimeline: (
    id: string,
    updates: Partial<TimelineConfig>,
  ) => Promise<void>;
  deleteTimeline: (id: string) => Promise<void>;
  reorderTimelines: (timelineIds: string[]) => Promise<void>;

  // Utility
  refresh: () => Promise<void>;
}

const StorageContext = createContext<StorageContextValue | null>(null);

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const [servers, setServers] = useState<MisskeyServerConnection[]>([]);
  const [timelines, setTimelines] = useState<TimelineConfig[]>([]);
  const [currentServerId, setCurrentServerId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const [serverData, timelineData, authState] = await Promise.all([
        storageManager.getAllServers(),
        storageManager.getAllTimelines(),
        storageManager.getAuthState(),
      ]);

      setServers(serverData);
      setTimelines(timelineData.sort((a, b) => a.order - b.order));
      setCurrentServerId(authState?.currentServerId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      console.error("Failed to load storage data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAuthState = async (updates: Partial<ClientAuthState>) => {
    const currentState = await storageManager.getAuthState();
    const newState: ClientAuthState = {
      currentServerId,
      servers,
      timelines,
      lastUpdated: new Date(),
      ...currentState,
      ...updates,
    };
    await storageManager.setAuthState(newState);
  };

  // Initialize storage and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        await storageManager.initialize();
        await loadData();
      } catch (err) {
        console.error("Failed to initialize storage:", err);
        setError("Failed to initialize storage");
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Server operations
  const addServer = async (
    server: Omit<MisskeyServerConnection, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newServer = await storageManager.addServer(server);
    setServers((prev) => [...prev, newServer]);
    await updateAuthState({ servers: [...servers, newServer] });
    return newServer;
  };

  const updateServer = async (
    id: string,
    updates: Partial<MisskeyServerConnection>,
  ) => {
    await storageManager.updateServer(id, updates);
    setServers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s,
      ),
    );
    const updatedServers = servers.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s,
    );
    await updateAuthState({ servers: updatedServers });
  };

  const deleteServer = async (id: string) => {
    await storageManager.deleteServer(id);
    setServers((prev) => prev.filter((s) => s.id !== id));
    setTimelines((prev) => prev.filter((t) => t.serverId !== id));

    if (currentServerId === id) {
      const newCurrentServerId = servers.find((s) => s.id !== id)?.id;
      setCurrentServerId(newCurrentServerId);
      await updateAuthState({
        currentServerId: newCurrentServerId,
        servers: servers.filter((s) => s.id !== id),
        timelines: timelines.filter((t) => t.serverId !== id),
      });
    } else {
      await updateAuthState({
        servers: servers.filter((s) => s.id !== id),
        timelines: timelines.filter((t) => t.serverId !== id),
      });
    }
  };

  const setCurrentServer = async (serverId?: string) => {
    setCurrentServerId(serverId);
    await updateAuthState({ currentServerId: serverId });
  };

  // Timeline operations
  const addTimeline = async (
    timeline: Omit<TimelineConfig, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newTimeline = await storageManager.addTimeline(timeline);
    setTimelines((prev) =>
      [...prev, newTimeline].sort((a, b) => a.order - b.order),
    );
    await updateAuthState({ timelines: [...timelines, newTimeline] });
    return newTimeline;
  };

  const updateTimeline = async (
    id: string,
    updates: Partial<TimelineConfig>,
  ) => {
    await storageManager.updateTimeline(id, updates);
    setTimelines((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
      ),
    );
    const updatedTimelines = timelines.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
    );
    await updateAuthState({ timelines: updatedTimelines });
  };

  const deleteTimeline = async (id: string) => {
    await storageManager.deleteTimeline(id);
    setTimelines((prev) => prev.filter((t) => t.id !== id));
    await updateAuthState({ timelines: timelines.filter((t) => t.id !== id) });
  };

  const reorderTimelines = async (timelineIds: string[]) => {
    await storageManager.reorderTimelines(timelineIds);
    const reorderedTimelines = timelineIds
      .map((id, index) => {
        const timeline = timelines.find((t) => t.id === id);
        return timeline
          ? { ...timeline, order: index, updatedAt: new Date() }
          : null;
      })
      .filter(Boolean) as TimelineConfig[];

    setTimelines(reorderedTimelines);
    await updateAuthState({ timelines: reorderedTimelines });
  };

  const refresh = async () => {
    await loadData();
  };

  const value: StorageContextValue = {
    servers,
    timelines,
    currentServerId,
    isLoading,
    error,
    addServer,
    updateServer,
    deleteServer,
    setCurrentServer,
    addTimeline,
    updateTimeline,
    deleteTimeline,
    reorderTimelines,
    refresh,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}
