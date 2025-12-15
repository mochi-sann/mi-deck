import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserProfile } from "@/features/user";

export const Route = createFileRoute("/_authed/user/$userId")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { currentServer } = useAuth();

  if (!currentServer) {
    return <div>No server selected</div>;
  }

  return (
    <UserProfile
      userId={userId}
      origin={currentServer.origin}
      token={currentServer.accessToken || ""}
    />
  );
}
