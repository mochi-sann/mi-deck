import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute(
  "/_authed/add-server/fallback/$origin",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    // This route is deprecated - redirect to the new auth callback
    navigate({
      to: "/callback/$origin",
      params: { origin: Route.useParams().origin },
      search: {
        session: Route.useSearch().session || "",
      },
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p>リダイレクト中...</p>
      </div>
    </div>
  );
}
