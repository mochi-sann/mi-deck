import { createLazyFileRoute } from "@tanstack/react-router";
import { $api } from "../../lib/api/fetchClient";

export const Route = createLazyFileRoute("/_authed/about")({
  component: About,
});

function About() {
  const { data, status } = $api.useQuery("get", "/v1/server-sessions");
  if (status === "pending") {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-2">
      <pre>{JSON.stringify(data, null, 2)}</pre>!
    </div>
  );
}
