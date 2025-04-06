import { TimelineList } from "@/Component/parts/TimelineList";
import { Heading } from "@/Component/ui/styled/heading";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/dashboard")({
  component: DashBoard,
});

function DashBoard() {
  return (
    <div>
      <Heading as="h2" size="lg" mb="4">
        Dashboard
      </Heading>
      <TimelineList />
    </div>
  );
}
