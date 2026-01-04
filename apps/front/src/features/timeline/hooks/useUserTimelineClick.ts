import type { Note } from "misskey-js/entities.js";
import { useCallback } from "react";
import { useStorage } from "@/lib/storage/context";

export function useUserTimelineClick(origin: string, user: Note["user"]) {
  const { servers, addTimeline } = useStorage();

  return useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const server = servers.find((s) => s.origin === origin);
      if (server) {
        addTimeline({
          name: user.name || user.username,
          serverId: server.id,
          type: "user",
          order: Date.now(), // Temporary order, backend/storage should handle this or list component will sort
          isVisible: true,
          settings: {
            userId: user.id,
          },
        });
      } else {
        console.error("Server not found for origin:", origin);
      }
    },
    [addTimeline, origin, servers, user],
  );
}
