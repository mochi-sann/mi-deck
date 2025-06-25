import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/callback/$origin")({
  validateSearch: (search: Record<string, unknown>) => ({
    session: search.session as string | undefined,
  }),
});
