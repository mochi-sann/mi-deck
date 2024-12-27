import { createLazyFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/add-server/fallback")({
  component: RouteComponent,
});

function RouteComponent() {
  const search = useSearch({ from: "/_authed/add-server/fallback" });
  return (
    <div>Hello "/_authed/add-server/fallback"!{JSON.stringify({ search })}</div>
  );
}
