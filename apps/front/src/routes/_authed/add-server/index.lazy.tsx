import Text from "@/Components/ui/text";
import { createLazyFileRoute } from "@tanstack/react-router";
import { NewServerForm } from "./-form/NewServerForm";

export const Route = createLazyFileRoute("/_authed/add-server/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Text>Hello "/_authed/add-server"!</Text>
      <NewServerForm />
    </div>
  );
}
