import { Text } from "@/Component/ui/styled/text";
import { Note } from "misskey-js/entities.js";
import { Box, Flex } from "styled-system/jsx"; // Import layout components
import { box } from "styled-system/patterns";
import { Avatar } from "../ui/avatar";

// Component to display a single Misskey note with a Twitter-like design
export function MisskeyNote({ note }: { note: Note }) {
  const user = note.user;

  return (
    <article
      key={note.id}
      className={box({
        p: "3", // Increased padding
        borderBottom: "solid 1px", // Border only at the bottom like Twitter feed
        borderColor: "gray.5", // Lighter border color
        display: "flex", // Use flexbox for layout
        gap: "3", // Gap between avatar and content
        _hover: { bg: "gray.50" }, // Subtle hover effect
      })}
    >
      {/* Avatar Column */}
      <Box flexShrink={0}>
        <Avatar src={note.user.avatarUrl || ""} />
      </Box>

      {/* Content Column */}
      <Flex direction="column" flexGrow={1} minW="0">
        {/* Header: User Info */}
        <Flex align="center" gap="1.5" wrap="wrap">
          <Text fontWeight="bold" fontSize="sm">
            {user.name || user.username}{" "}
            {/* Display name or username if name is missing */}
          </Text>
          <Text color="gray.500" fontSize="sm">
            @{user.username}
          </Text>
          {/* Optional: Timestamp - requires date formatting */}
          {/* <Text color="gray.500" fontSize="xs">· {formatDistanceToNow(new Date(note.createdAt))}</Text> */}
        </Flex>

        {/* Body: Note Text */}
        <Box mt="1">
          {/* Use whitespace pre-wrap to preserve line breaks */}
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {note.text || <i>(No Text)</i>}
          </Text>
        </Box>

        {/* Optional: Actions (Reply, Renote, Like) - Add later if needed */}
        {/* <Flex mt="2" gap="4"> ... </Flex> */}
      </Flex>
    </article>
  );
}
