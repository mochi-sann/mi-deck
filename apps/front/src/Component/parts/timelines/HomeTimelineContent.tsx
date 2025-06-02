import Text from "@/Component/ui/text";
import { Stream } from "misskey-js";
import { APIClient } from "misskey-js/api.js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useState } from "react";
import { TimelineNotes } from "./TimelineNotes";

// Component to fetch and display posts for a single timeline
export function HomeTimelineContent({
  origin,
  token: serverToken,
  type,
}: {
  origin: string;
  token: string;
  type: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const client = new APIClient({
      origin,
      credential: serverToken,
    });

    // Initial fetch
    client
      .request("notes/timeline", {})
      .then((res) => {
        setNotes(res);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      });

    // Setup WebSocket connection
    const stream = new Stream(origin, { token: serverToken });
    const channel = stream.useChannel("homeTimeline");

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
  }, [origin, serverToken]);

  if (error) {
    return (
      <Text color="red.500">
        Error loading notes: {error.message || "Unknown error"}
      </Text>
    );
  }

  return <TimelineNotes notes={notes} />;
}
