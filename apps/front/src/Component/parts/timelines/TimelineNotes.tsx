import { Spinner } from "@/Component/ui/spinner";
import Text from "@/Component/ui/text";
import { Note } from "misskey-js/entities.js";
import type React from "react";
import { useEffect, useRef } from "react";
import { MisskeyNote } from "../MisskeyNote";

export type TimelineNotesProps = {
  notes: Note[] | undefined;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

export const TimelineNotes: React.FC<TimelineNotesProps> = ({
  notes,
  onLoadMore,
  hasMore,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastNoteRef = useRef<HTMLLIElement | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (lastNoteRef.current) {
      observerRef.current.observe(lastNoteRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, hasMore, notes]);

  if (!notes) {
    return <Spinner />;
  }

  if (notes.length === 0) {
    return <Text affects="small">No notes found.</Text>;
  }

  return (
    <ul className="flex list-none flex-col p-0">
      {notes.map((note, index) => (
        <li
          key={note.id}
          ref={index === notes.length - 1 ? lastNoteRef : undefined}
        >
          <MisskeyNote note={note} />
        </li>
      ))}
      {hasMore && <Spinner />}
    </ul>
  );
};
