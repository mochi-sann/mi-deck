import { createLazyFileRoute } from "@tanstack/react-router";
import { LoginForm } from "./-form/LoginForm";

export const Route = createLazyFileRoute("/login/")({
  component: Index,
});

export function Index() {
  return (
    <div className="p-2">
      <h3>Welcome login page!</h3>
      <LoginForm />
    </div>
  );
}
