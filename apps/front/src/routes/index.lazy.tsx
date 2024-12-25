import { createLazyFileRoute } from "@tanstack/react-router";
import { TestComponet } from "../Component/TestComponet";
import { AddServerForm } from "../Component/login/AddServerForm";
import { LogoutButton } from "./login/-componets/LogoutButton";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <LogoutButton />
      <AddServerForm />
      <TestComponet />
    </div>
  );
}
