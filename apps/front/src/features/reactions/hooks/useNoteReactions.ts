import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Misskey from "misskey-js";
import type { Note } from "misskey-js/entities.js";
import { useCallback, useRef, useState } from "react";
import { useHover } from "usehooks-ts";
import { storageManager } from "@/lib/storage";

interface UseNoteReactionsOptions {
  noteId: string;
  origin: string;
  note: Note;
}

interface ReactToNoteParams {
  reaction: string;
}
export const GetReactionsWithCounts = (note: Note) => {
  if (!note?.reactions) return [];

  return Object.entries(note.reactions)
    .filter(([, count]) => count > 0)
    .map(([reaction, count]) => ({
      reaction,
      count,
    }))
    .sort((a, b) => b.count - a.count);
};

export function useNoteReactions({
  noteId,
  origin,
  note,
}: UseNoteReactionsOptions) {
  const queryClient = useQueryClient();
  const [_reactions, _setReactionsWithEmojis] = useState(
    Object.entries(note.reactions),
  );

  const createMisskeyClient = useCallback(async () => {
    await storageManager.initialize();
    const servers = await storageManager.getAllServers();
    const server = servers.find((s) => s.origin === origin && s.isActive);

    if (!server?.accessToken) {
      throw new Error(`No active server found for origin: ${origin}`);
    }

    return new Misskey.api.APIClient({
      origin: server.origin,
      credential: server.accessToken,
    });
  }, [origin]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const isReactionButtonHover = useHover(buttonRef);
  if (isReactionButtonHover) {
  }
  console.log(
    ...[
      isReactionButtonHover,
      "👀 [useNoteReactions.ts:56]: isReactionButtonHover",
    ].reverse(),
  );
  const { data: reactions = [], isLoading: reactionsLoading } = useQuery({
    queryKey: ["note-reactions", noteId, origin],
    queryFn: async () => {
      const client = await createMisskeyClient();
      return client.request("notes/reactions", {
        noteId,
      });
    },
    enabled: !!noteId && !!origin,
    staleTime: 1000 * 60,
    refetchInterval: false,
  });

  const reactToNoteMutation = useMutation({
    mutationFn: async ({ reaction }: ReactToNoteParams) => {
      const client = await createMisskeyClient();
      return client.request("notes/reactions/create", {
        noteId,
        reaction,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["note-reactions", noteId, origin],
      });
      queryClient.invalidateQueries({
        queryKey: ["timeline"],
      });
    },
    onError: (error) => {
      console.error("Failed to add reaction:", error);
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      const client = await createMisskeyClient();
      return client.request("notes/reactions/delete", {
        noteId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["note-reactions", noteId, origin],
      });
      queryClient.invalidateQueries({
        queryKey: ["timeline"],
      });
    },
    onError: (error) => {
      console.error("Failed to remove reaction:", error);
    },
  });

  const [myReaction, _setMyReaction] = useState(note.myReaction);
  const reactToNote = useCallback(
    (reaction: string) => {
      reactToNoteMutation.mutate({ reaction });
    },
    [reactToNoteMutation],
  );

  const removeReaction = useCallback(() => {
    removeReactionMutation.mutate();
  }, [removeReactionMutation]);

  const toggleReaction = useCallback(
    (reaction: string) => {
      console.log(
        ...[reaction, "👀 [useNoteReactions.ts:124]: reaction"].reverse(),
      );
      if (myReaction === reaction) {
        removeReaction();
      } else {
        reactToNote(reaction);
      }
    },
    [myReaction, reactToNote, removeReaction],
  );

  return {
    reactions: reactions,
    myReaction,
    reactToNote,
    removeReaction,
    toggleReaction,
    isReacting: reactToNoteMutation.isPending,
    isRemoving: removeReactionMutation.isPending,
    buttonRef,
    isReactionButtonHover,
    // reactionsLoading,
  };
}
