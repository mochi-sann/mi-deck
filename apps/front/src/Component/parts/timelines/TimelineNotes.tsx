import { Spinner } from "@/Component/ui/spinner";
import Text from "@/Component/ui/text";
import { Note } from "misskey-js/entities.js";
import type React from "react";
import { MisskeyNote } from "../MisskeyNote";

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
