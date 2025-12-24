import { UserDetailed } from "misskey-js/entities.js";
import { useCallback, useEffect, useState } from "react";
import { UserApi } from "../api/userApi";

export function useUser(origin: string, token: string, userId: string) {
  const [user, setUser] = useState<UserDetailed | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!origin || !token || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const api = new UserApi(origin, token);
      const fetchedUser = await api.getUser(userId);
      setUser(fetchedUser);
    } catch (err) {
      console.error("User fetch error:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch user"));
    } finally {
      setIsLoading(false);
    }
  }, [origin, token, userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, error, isLoading, refetch: fetchUser };
}
