import { Spinner } from "@/Component/ui/spinner";
import Text from "@/Component/ui/text";
import { Note } from "misskey-js/entities.js";
import type React from "react";
import { Suspense } from "react";
import { MisskeyNote } from "../MisskeyNote";

export type TimelineNotesProps = {
  notes: Note[] | undefined;
};

export const TimelineNotes: React.FC<TimelineNotesProps> = (props) => {
  return (
    <div>
      {" "}
      <Suspense fallback={<Spinner />}>
        <ul className={"flex list-none flex-col p-0"}>
          {props.notes && props.notes.length > 0 ? (
            // Render MisskeyNote directly, it's now an <article> but can be a child of <ul>
            props.notes.map((note) => <MisskeyNote key={note.id} note={note} />)
          ) : (
            <Text affects={"small"}>No notes found.</Text>
          )}
        </ul>
      </Suspense>
    </div>
  );
};
