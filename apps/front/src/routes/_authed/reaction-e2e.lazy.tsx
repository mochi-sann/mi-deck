import { createLazyFileRoute } from "@tanstack/react-router";
import type { Note } from "misskey-js/entities.js";
import { useEffect, useState } from "react";
import { NoteReactions } from "@/features/reactions/components/NoteReactions";
import { ReactionButton } from "@/features/reactions/components/ReactionButton";
import { storageManager } from "@/lib/storage";

export const Route = createLazyFileRoute("/_authed/reaction-e2e")({
  component: ReactionE2ePage,
});

function ReactionE2ePage() {
  const [ready, setReady] = useState(false);

  const origin = "https://example.com";

  useEffect(() => {
    (async () => {
      await storageManager.initialize();
      const servers = await storageManager.getAllServers();
      const exists = servers.find((s) => s.origin === origin);
      if (!exists) {
        await storageManager.addServer({
          origin,
          accessToken: "test-token",
          isActive: true,
        });
      } else if (!exists.isActive) {
        await storageManager.updateServer(exists.id, { isActive: true });
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return <div data-testid="loading">loading...</div>;

  const note = {
    id: "note-e2e",
    createdAt: new Date().toISOString(),
    text: "E2E Reaction Test",
    user: {
      id: "user-e2e",
      username: "e2e",
      name: "E2E",
      host: "example.com",
      avatarUrl: "",
      avatarBlurhash: null,
      avatarDecorations: [],
      isBot: false,
      isCat: false,
      onlineStatus: "online",
      badgeRoles: [],
      emojis: {},
      instance: undefined,
    },
    replyId: null,
    renoteId: null,
    reply: null,
    renote: null,
    visibility: "public",
    mentions: [],
    visibleUserIds: [],
    fileIds: [],
    files: [],
    tags: [],
    poll: null,
    emojis: {},
    reactions: {},
    reactionEmojis: {},
    uri: undefined,
    url: undefined,
    userId: "user-e2e",
    myReaction: null,
    reactionCount: 0,
    renoteCount: 0,
    reactionAcceptance: null,
    repliesCount: 0,
  } as unknown as Note;

  return (
    <div id="e2e-reaction">
      <div style={{ padding: 16 }}>
        <NoteReactions note={note} origin={origin} emojis={{}} />
        <div style={{ marginTop: 8 }}>
          <ReactionButton note={note} origin={origin} emojis={{}} />
        </div>
      </div>
    </div>
  );
}
