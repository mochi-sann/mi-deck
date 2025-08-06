import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as v from "valibot";

export const Route = createFileRoute("/callback/$origin")({
  validateSearch: v.object({
    session: v.fallback(v.string(), ""),
  }),
  component: AuthCallbackComponent,
});
function AuthCallbackComponent() {
  return <Outlet />;
}
