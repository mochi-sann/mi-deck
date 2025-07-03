import type { Note } from "misskey-js/entities.js";
import type React from "react";
import { Spinner } from "@/components/ui/spinner";
import Text from "@/components/ui/text";
import { MisskeyNote } from "./MisskeyNote";

export type TimelineNotesProps = {
  notes: Note[] | undefined;
};

export const TimelineNotes: React.FC<TimelineNotesProps> = ({ notes }) => {
  if (!notes) {
    return <Spinner />;
  }

  if (notes.length === 0) {
    return <Text affects="small">No notes found.</Text>;
  }

  return (
    <ul className="flex list-none flex-col p-0">
      {notes.map((note) => (
        <li key={note.id}>
          <MisskeyNote note={note} />
        </li>
      ))}
    </ul>
  );
};
