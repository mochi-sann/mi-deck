import type { Note } from "misskey-js/entities.js";
import type React from "react";
import { Spinner } from "@/components/ui/spinner";
import Text from "@/components/ui/text";
import { MisskeyNote } from "./MisskeyNote";

export type TimelineNotesProps = {
  notes: Note[] | undefined;
  origin: string;
};

export const TimelineNotes: React.FC<TimelineNotesProps> = ({
  notes,
  origin,
}) => {
  if (!notes) {
    return <Spinner />;
  }

  if (notes.length === 0) {
    return <Text affects="small">No notes found.</Text>;
  }

  return (
    <ul className="flex list-none flex-col p-0">
      {notes.map((note) => {
        const isRecent =
          Date.now() - new Date(note.createdAt).getTime() < 15000;
        return (
          <li
            key={note.id}
            className={
              isRecent
                ? "fade-in slide-in-from-top-8 animate-in duration-500"
                : ""
            }
          >
            <MisskeyNote note={note} origin={origin} />
          </li>
        );
      })}
    </ul>
  );
};
