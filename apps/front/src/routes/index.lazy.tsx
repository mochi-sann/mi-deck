import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { TestComponet } from "../Component/TestComponet";
import { LogoutButton } from "./login/-componets/LogoutButton";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <LogoutButton />
      <TestComponet />
      <Link to="/add-server">add server</Link>
    </div>
  );
}
