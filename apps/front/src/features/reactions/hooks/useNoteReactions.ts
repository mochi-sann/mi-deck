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
    () => ({ ...(note.reactions || {}) }),
  );

  useEffect(() => {
    setMyReaction(note.myReaction ?? null);
    setReactionsMap({ ...(note.reactions || {}) });
  }, [note.id, note.myReaction, note.reactions]);

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
  } = useQuery({
    queryKey: ["note-reactions", noteId, origin],
    queryFn: async () => {
      const client = await createMisskeyClient();
      return client.request("notes/reactions", {
        noteId,
      });
    },
    enabled: !!noteId && !!origin && shouldLoadDetails,
    staleTime: 1000 * 60,
    refetchInterval: false,
  });

  // Normalize API response to a safe, display-ready structure
  type ReactionUser = {
    id: string;
    username?: string;
    name?: string;
    avatarUrl?: string;
  };
  type ReactionDetail = {
    reaction: string;
    user: ReactionUser;
  };

  const reactionDetails: ReactionDetail[] = Array.isArray(reactionsRaw)
    ? (reactionsRaw as any[])
        .map((r: any) => {
          const user = r?.user ?? {};
          const id = String(user?.id ?? "");
          return {
            reaction: String(r?.reaction ?? ""),
            user: {
              id,
              username: user?.username,
              name: user?.name,
              avatarUrl: user?.avatarUrl,
            },
          } as ReactionDetail;
        })
        .filter((d) => d.user.id && d.reaction)
    : [];

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
