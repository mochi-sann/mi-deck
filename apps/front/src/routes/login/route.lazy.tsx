import { LoadingSpinner } from "@/Components/ui/loading-spinner";
import Text from "@/Components/ui/text";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useUser } from "../../lib/configureAuth";
import { LogoutButton } from "./-componets/LogoutButton";
import { LoginForm } from "./-form/LoginForm";

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
          <LoadingSpinner />
        ) : status === "error" ? (
          <div>error...</div>
        ) : (
          <div>
            <h3>ログイン情報</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
        <div>
          <Text variant={"h1"}>ログアウトする</Text>
          <LogoutButton />
        </div>
        <div>
          <Text variant={"h1"}>ログインする</Text>
          <div className={"flex flex-row gap-4 p-4"}>
            <LoginForm />
          </div>
        </div>
      </div>
      Hello "/login"!
    </div>
  );
}
