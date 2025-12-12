import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Misskey from "misskey-js";
import type { Note } from "misskey-js/entities.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { storageManager } from "@/lib/storage";

interface UseNoteReactionsOptions {
  noteId: string;
  origin: string;
  note: Note;
  shouldLoadDetails?: boolean;
}

interface ReactToNoteParams {
  reaction: string;
}

export type ReactionUser = {
  id: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
};

export type NoteReactionEntry = {
  id: string;
  reaction: string;
  createdAt?: string;
  user: ReactionUser | null;
};

const parseNoteReactionUser = (input: unknown): ReactionUser | null => {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const candidate = input as Record<string, unknown>;
  const id = candidate.id;

  if (id === undefined || id === null) {
    return null;
  }

  const username =
    typeof candidate.username === "string" ? candidate.username : undefined;
  const name = typeof candidate.name === "string" ? candidate.name : undefined;
  const avatarUrl =
    typeof candidate.avatarUrl === "string" ? candidate.avatarUrl : undefined;

  return {
    id: String(id),
    username,
    name,
    avatarUrl,
  };
};

const parseNoteReactionEntry = (input: unknown): NoteReactionEntry | null => {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const candidate = input as Record<string, unknown>;
  const idValue = candidate.id;
  const reactionCandidate =
    typeof candidate.reaction === "string" && candidate.reaction.length > 0
      ? candidate.reaction
      : typeof candidate.type === "string"
        ? candidate.type
        : null;

  if (idValue === undefined || idValue === null || !reactionCandidate) {
    return null;
  }

  const createdAt =
    typeof candidate.createdAt === "string" ? candidate.createdAt : undefined;
  const user = parseNoteReactionUser(candidate.user);

  return {
    id: String(idValue),
    reaction: reactionCandidate,
    createdAt,
    user,
  };
};

const parseReactionsResponse = (value: unknown): NoteReactionEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => parseNoteReactionEntry(entry))
    .filter((entry): entry is NoteReactionEntry => entry !== null);
};
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
  shouldLoadDetails = false,
}: UseNoteReactionsOptions) {
  const queryClient = useQueryClient();
  // Local optimistic state derived from note.reactions and note.myReaction
  const [myReaction, setMyReaction] = useState<string | null>(
    note.myReaction ?? null,
  );
  const [reactionsMap, setReactionsMap] = useState<Record<string, number>>(
    () => ({ ...note.reactions }),
  );

  useEffect(() => {
    setMyReaction(note.myReaction ?? null);
    setReactionsMap({ ...note.reactions });
  }, [note.myReaction, note.reactions]);

  // Aggregated counts for list display (sorted)
  const reactionsWithCounts = useMemo(() => {
    return Object.entries(reactionsMap)
      .filter(([, count]) => count > 0)
      .map(([reaction, count]) => ({ reaction, count }))
      .sort((a, b) => b.count - a.count);
  }, [reactionsMap]);

  // Total count for compact display
  const totalReactionCount = useMemo(
    () => Object.values(reactionsMap).reduce((acc, n) => acc + n, 0),
    [reactionsMap],
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

  const {
    data: reactionsRaw = [],
    isLoading: reactionsLoading,
    refetch: refetchReactions,
  } = useQuery<NoteReactionEntry[]>({
    queryKey: ["note-reactions", noteId, origin],
    queryFn: async () => {
      const client = await createMisskeyClient();
      const response = await client.request("notes/reactions", {
        noteId,
      });
      return parseReactionsResponse(response);
    },
    enabled: !!noteId && !!origin && shouldLoadDetails,
    staleTime: 1000 * 60,
    refetchInterval: false,
  });

  // Normalize API response to a safe, display-ready structure
  type ReactionDetail = {
    reaction: string;
    user: ReactionUser;
  };

  const reactionDetails: ReactionDetail[] = reactionsRaw
    .map((entry) => {
      if (!entry.user) {
        return null;
      }
      return {
        reaction: entry.reaction,
        user: entry.user,
      };
    })
    .filter((detail): detail is ReactionDetail => detail !== null);

  const reactToNoteMutation = useMutation({
    mutationFn: async ({ reaction }: ReactToNoteParams) => {
      const client = await createMisskeyClient();
      return client.request("notes/reactions/create", {
        noteId,
        reaction,
      });
    },
    onMutate: async ({ reaction }) => {
      // Optimistically update local state
      const previousState = {
        myReaction: myReaction ?? null,
        reactionsMap: { ...reactionsMap },
      } as const;

      setReactionsMap((prev) => {
        const next = { ...prev };
        if (myReaction && myReaction !== reaction) {
          // Switching reaction: decrement previous
          if (next[myReaction] && next[myReaction] > 0) next[myReaction] -= 1;
        }
        // Increment new reaction
        next[reaction] = (next[reaction] || 0) + 1;
        return next;
      });
      setMyReaction(reaction);

      return { previousState };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to add reaction:", error);
      // Revert optimistic update
      if (context?.previousState) {
        setMyReaction(context.previousState.myReaction);
        setReactionsMap(context.previousState.reactionsMap);
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["note-reactions", noteId, origin],
      });
      queryClient.invalidateQueries({
        queryKey: ["timeline"],
      });
      await refetchReactions();
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      const client = await createMisskeyClient();
      return client.request("notes/reactions/delete", {
        noteId,
      });
    },
    onMutate: async () => {
      // Optimistically remove current reaction
      const previousState = {
        myReaction: myReaction ?? null,
        reactionsMap: { ...reactionsMap },
      } as const;

      if (myReaction) {
        setReactionsMap((prev) => {
          const next = { ...prev };
          if (next[myReaction] && next[myReaction] > 0) next[myReaction] -= 1;
          return next;
        });
      }
      setMyReaction(null);

      return { previousState };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to remove reaction:", error);
      // Revert optimistic update
      if (context?.previousState) {
        setMyReaction(context.previousState.myReaction);
        setReactionsMap(context.previousState.reactionsMap);
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["note-reactions", noteId, origin],
      });
      queryClient.invalidateQueries({
        queryKey: ["timeline"],
      });
      await refetchReactions();
    },
  });

  const reactToNote = useCallback(
    async (reaction: string) => {
      await reactToNoteMutation.mutateAsync({ reaction });
    },
    [reactToNoteMutation],
  );

  const removeReaction = useCallback(async () => {
    await removeReactionMutation.mutateAsync();
  }, [removeReactionMutation]);

  const toggleReaction = useCallback(
    async (reaction: string) => {
      console.log(
        ...[reaction, "👀 [useNoteReactions.ts:124]: reaction"].reverse(),
      );
      if (myReaction === reaction) {
        await removeReaction();
      } else {
        await reactToNote(reaction);
      }
    },
    [myReaction, reactToNote, removeReaction],
  );

  return {
    // For list displays (counts per emoji)
    reactions: reactionsWithCounts,
    // Detailed entries (who reacted with what)
    reactionDetails,
    myReaction,
    totalReactionCount,
    reactToNote,
    removeReaction,
    toggleReaction,
    isReacting: reactToNoteMutation.isPending,
    isRemoving: removeReactionMutation.isPending,
    reactionsRaw,
    reactionsLoading,
    refetchReactions,
  };
}
