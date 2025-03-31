import { MisskeyJsTest } from "@/Component/logics/MisskeyJsTest";
import { Timeline } from "@/Component/logics/Timeline";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authed/dassboard")({
  component: DashBoard,
});

function DashBoard() {
  return (
    <div>
      Hello "/_authed/dassboard"!
      <MisskeyJsTest />
    </div>
  );
}
