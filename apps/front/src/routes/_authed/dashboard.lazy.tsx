import { TimelineList } from "@/Component/parts/TimelineList";
import Text from "@/Component/ui/text";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/dashboard")({
  component: DashBoard,
});

function DashBoard() {
  return (
    <div>
      <Text className="fint-lg mb-4">Dashboard</Text>
      <TimelineList />
    </div>
  );
}
