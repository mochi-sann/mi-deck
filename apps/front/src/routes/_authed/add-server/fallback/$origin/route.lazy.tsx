import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute(
  "/_authed/add-server/fallback/$origin",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const params = Route.useParams();
  const search = Route.useSearch();

  useEffect(() => {
    // This route is deprecated - redirect to the new auth callback
    navigate({
      to: "/callback/$origin",
      params: { origin: params.origin },
      search: {
        session: search.session || "",
      },
    });
  }, [navigate, params.origin, search.session]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p>リダイレクト中...</p>
      </div>
    </div>
  );
}
