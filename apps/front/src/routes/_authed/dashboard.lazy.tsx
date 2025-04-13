import { TimelineList } from "@/Component/parts/TimelineList";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/dashboard")({
  component: DashBoard,
});

function DashBoard() {
  return <TimelineList />;
}
