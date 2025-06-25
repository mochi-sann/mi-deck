import { ServerInfoBox } from "@/Component/parts/ServerList";
import { useAuth } from "@/lib/auth/context";
import { useStorage } from "@/lib/storage/context";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/about")({
  component: About,
});

function About() {
  const storage = useStorage();
  const auth = useAuth();

  const handleRefresh = async (serverId: string) => {
    try {
      await auth.refreshServerInfo(serverId);
    } catch (error) {
      console.error("Failed to refresh server info:", error);
    }
  };

  const handleRemove = async (serverId: string) => {
    try {
      await auth.removeServer(serverId);
    } catch (error) {
      console.error("Failed to remove server:", error);
    }
  };

  const handleSelect = async (serverId: string) => {
    try {
      await auth.switchServer(serverId);
    } catch (error) {
      console.error("Failed to switch server:", error);
    }
  };

  if (storage.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-2">
      <div className="font-bold text-2xl">About</div>
      <div className="flex flex-col gap-2">
        {storage.servers.length > 0
          ? storage.servers.map((server) => (
              <ServerInfoBox
                key={server.id}
                serverInfo={server}
                onRefresh={handleRefresh}
                onRemove={handleRemove}
                onSelect={handleSelect}
                isSelected={storage.currentServerId === server.id}
              />
            ))
          : "No servers connected"}
      </div>
    </div>
  );
}
