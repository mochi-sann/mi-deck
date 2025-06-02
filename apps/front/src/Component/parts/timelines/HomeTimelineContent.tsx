import Text from "@/Component/ui/text";
import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useState } from "react";
import { TimelineNotes } from "./TimelineNotes";

type TimelineType = "home" | "local" | "global";

// Custom hook for timeline functionality
function useTimeline(origin: string, token: string, type: TimelineType) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const client = new APIClient({
      origin,
      credential: token,
    });

    // Initial fetch
    const endpoint =
      type === "home" ? "notes/timeline" : `notes/${type}-timeline`;
    // biome-ignore lint/suspicious/noExplicitAny:
    (client as any)
      .request(endpoint, {})
      .then((res: unknown) => {
        if (Array.isArray(res)) {
          setNotes(res as Note[]);
        } else {
          setError(new Error("Invalid response format"));
        }
      })
      .catch((err: Error) => {
        console.error(err);
        setError(err);
      });

    // Setup WebSocket connection
    const stream = new Stream(origin, { token });
    const channel = stream.useChannel(`${type}Timeline`);

    // Handle new notes
    channel.on("note", (note: Note) => {
      setNotes((prevNotes) => [note, ...prevNotes]);
    });

    // Handle disconnection
    stream.on("_disconnected_", () => {
      console.error("Stream disconnected");
      setError(new Error("Connection lost"));
    });

    // Cleanup on unmount
    return () => {
      channel.dispose();
      stream.close();
    };
  }, [origin, token, type]);

  return { notes, error };
}

// Component to fetch and display posts for a single timeline
export function HomeTimelineContent({
  origin,
  token: serverToken,
  type,
}: {
  origin: string;
  token: string;
  type: TimelineType;
}) {
  const { notes, error } = useTimeline(origin, serverToken, type);

  if (error) {
    return (
      <Text color="red.500">
        Error loading notes: {error.message || "Unknown error"}
      </Text>
    );
  }

  return <TimelineNotes notes={notes} />;
}
