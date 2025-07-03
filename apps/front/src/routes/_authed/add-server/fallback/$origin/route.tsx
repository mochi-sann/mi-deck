import { createFileRoute, Outlet } from "@tanstack/react-router";

import * as v from "valibot";
export const Route = createFileRoute("/_authed/add-server/fallback/$origin")({
  component: RouteComponent,
  validateSearch: v.object({
    session: v.optional(v.fallback(v.string(), "")),
  }),
});

function RouteComponent() {
  return <Outlet />;
}
