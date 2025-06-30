import { useTimeline } from "@/Component/parts/timelines/hooks/useTimeline";
import { useStorage } from "@/lib/storage/context";
import type React from "react";

export const Timeline: React.FC = () => {
  const { servers, currentServerId } = useStorage();

  const currentServer = servers.find((s) => s.id === currentServerId);

  const { notes, error, isLoading } = useTimeline(
    currentServer?.origin || "",
    currentServer?.accessToken || "",
    "home",
  );

  if (!currentServer) {
    return <div>No server selected</div>;
  }

  if (isLoading) return "Loading...";

  if (error) return `An error has occurred: ${error.message}`;

  return (
    <div>
      <h3>Timeline for {currentServer.origin}</h3>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
        >
          <p>
            <strong>{note.user.name || note.user.username}</strong>
          </p>
          <p>{note.text}</p>
          <small>{new Date(note.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};
