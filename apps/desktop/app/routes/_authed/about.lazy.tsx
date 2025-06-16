import { ServerInfoBox } from "@/Component/parts/ServerList";
import { createLazyFileRoute } from "@tanstack/react-router";
import { $api } from "../../lib/api/fetchClient";

export const Route = createLazyFileRoute("/_authed/about")({
  component: About,
});

function About() {
  const { data, status } = $api.useQuery("get", "/v1/server-sessions");

  const { mutateAsync } = $api.useMutation(
    "post",
    "/v1/server-sessions/update-server-info",
  );
  const onClick = async (origin: string) => {
    await mutateAsync({
      body: {
        origin,
      },
    });
  };
  if (status === "pending") {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-2">
      <div className="font-bold text-2xl">About</div>
      <div className="flex flex-col gap-2">
        {data
          ? data.map((d) => (
              <ServerInfoBox onClick={onClick} key={d.id} serverInfo={d} />
            ))
          : "No data"}
      </div>
    </div>
  );
}
