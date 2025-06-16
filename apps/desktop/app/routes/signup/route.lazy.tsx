import { LoadingSpinner } from "@/Component/ui/loading-spinner";
import Text from "@/Component/ui/text";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useUser } from "../../lib/configureAuth";
import { SignUpForm } from "./-form/SignUpForm";

export const Route = createLazyFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const { status, data } = useUser();
  return (
    <div>
      <div className="p-2">
        <h3>Welcome register page!</h3>
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
          <Text variant={"h1"}>新規登録する</Text>
          <div className={"flex flex-row gap-4 p-4"}>
            <SignUpForm />
          </div>
        </div>
      </div>
      Hello "/register"!
    </div>
  );
}
