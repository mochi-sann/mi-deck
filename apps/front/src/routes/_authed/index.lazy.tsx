import { ClientTimelineList } from "@/features/timeline";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <ClientTimelineList />
    </div>
  );
}
