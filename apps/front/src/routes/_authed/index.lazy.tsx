import { createLazyFileRoute } from "@tanstack/react-router";
import { ClientTimelineList } from "@/features/timeline";

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
