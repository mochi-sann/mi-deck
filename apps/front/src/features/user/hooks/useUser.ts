import { useQuery } from "@tanstack/react-query";
import type { UserDetailed } from "misskey-js/entities.js";
import { UserApi } from "../api/userApi";

export function useUser(origin: string, token: string, userId: string) {
  const isValidConfig =
    origin &&
    token &&
    userId &&
    origin.trim() !== "" &&
    token.trim() !== "" &&
    userId.trim() !== "";

  const {
    data: user = null,
    error,
    isLoading,
    refetch,
  } = useQuery<UserDetailed>({
    queryKey: ["user", origin, token, userId],
    enabled: Boolean(isValidConfig),
    queryFn: async () => {
      const api = new UserApi(origin, token);
      return await api.getUser(userId);
    },
    retry: 1,
    staleTime: 1000 * 60,
  });

  return {
    user,
    error: error instanceof Error ? error : null,
    isLoading,
    refetch: async () => {
      await refetch();
    },
  };
}
