import { Text } from "@/Component/ui/styled/text";
import { Note } from "misskey-js/entities.js";
import { css } from "styled-system/css";

// Component to display a single Misskey note
export function MisskeyNote({ note }: { note: Note }) {
  return (
    <li
      key={note.id}
      className={css({
        p: "2",
        border: "solid 1px",
        borderRadius: "md",
        borderColor: "gray.300", // Added border color for better visibility
        listStyle: "none", // Remove default list styling
      })}
    >
      <Text fontSize="xs">{note.text || <i>(No Text)</i>}</Text>
      <Text fontSize="2xs" color="gray.500" textAlign="right">
        @{note.user.username}
      </Text>
    </li>
  );
}
