import type React from "react";
import { useStorage } from "../lib/storage/context";

export const TestComponet: React.FC = () => {
  const { servers, currentServerId, isLoading, error } = useStorage();

  const currentServer = servers.find((s) => s.id === currentServerId);

  if (isLoading) return "Loading...";

  if (error) return `An error has occurred: ${error}`;

  return (
    <div>
      <h3>Current Server:</h3>
      {currentServer ? (
        <pre>{JSON.stringify(currentServer, null, 2)}</pre>
      ) : (
        <p>No server selected</p>
      )}
      <h3>All Servers:</h3>
      <pre>{JSON.stringify(servers, null, 2)}</pre>
    </div>
  );
};
