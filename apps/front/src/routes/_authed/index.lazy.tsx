import { TimelineList } from "@/Components/parts/TimelineList";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <TimelineList />
    </div>
  );
}
