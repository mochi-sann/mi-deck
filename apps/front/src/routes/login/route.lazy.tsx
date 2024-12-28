import { createLazyFileRoute } from "@tanstack/react-router";
import { Heading } from "../../Component/ui/heading";
import { useUser } from "../../lib/configureAuth";
import { LogoutButton } from "./-componets/LogoutButton";
import { LoginForm } from "./-form/LoginForm";
import { SignUpForm } from "./-form/SignUpForm";

export const Route = createLazyFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { status, data } = useUser();
  return (
    <div>
      <div className="p-2">
        <h3>Welcome login page!</h3>
        {status === "pending" ? (
          <div>loading...</div>
        ) : status === "error" ? (
          <div>error...</div>
        ) : (
          <div>
            <h3>ログイン情報</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
        <div>
          <Heading as={"h1"}>ログアウトする</Heading>
          <LogoutButton />
        </div>
        <div>
          <Heading as={"h1"}>ログインする</Heading>
          <LoginForm />
          <hr />
          <SignUpForm />
        </div>
      </div>
      Hello "/login"!
    </div>
  );
}
