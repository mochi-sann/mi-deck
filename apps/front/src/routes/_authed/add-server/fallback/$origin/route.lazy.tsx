import { Button } from "@/Component/ui/button";
import { Text } from "@/Component/ui/text";
import { $api } from "@/lib/api/fetchClient";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/_authed/add-server/fallback/$origin",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const params = Route.useParams();
  const sessionToken = search.session;
  const { mutateAsync, status } = $api.useMutation(
    "post",
    "/v1/server-sessions",
    {},
  );
  const OnSubmit = async () => {
    const response = await mutateAsync({
      body: {
        sessionToken: sessionToken || "",
        origin: `https://${params.origin}`,
        serverType: "misskey",
      },
    });
    console.log(response);
  };
  return (
    <div>
      にゃああああああああああああああああん Hello
      "/_authed/add-server/fallback"!
      <pre>{JSON.stringify({ search: search }, null, 2)}</pre>
      <Button onClick={OnSubmit} loading={status === "pending"}>
        サーバーを追加
      </Button>
      {status === "error" ? <Text>エラーが発生しました</Text> : null}
      {status === "success" ? <Text>サーバーを追加しました</Text> : null}
    </div>
  );
}
