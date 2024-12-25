import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/add-server")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authed/add-server"!</div>;
}
