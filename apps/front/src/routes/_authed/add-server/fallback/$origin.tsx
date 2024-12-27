import { Button } from "@/Component/ui/button";
import { $api } from "@/lib/api/fetchClient";
import { createFileRoute } from "@tanstack/react-router";

import * as v from "valibot";
export const Route = createFileRoute("/_authed/add-server/fallback/$origin")({
  component: RouteComponent,
  validateSearch: v.object({
    session: v.optional(v.fallback(v.string(), "")),
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const params = Route.useParams();
  const sessionToken = search.session;
  const { mutateAsync } = $api.useMutation("post", "/v1/server-sessions", {});
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
      Hello "/_authed/add-server/fallback"!
      <pre>{JSON.stringify({ search: search }, null, 2)}</pre>
      <Button onClick={OnSubmit}>サーバーを追加</Button>
    </div>
  );
}
