import { createLazyFileRoute } from "@tanstack/react-router";
import { TestComponet } from "../Component/TestComponet";
import { AddServerForm } from "../Component/login/AddServerForm";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <AddServerForm />
      <TestComponet />
    </div>
  );
}
