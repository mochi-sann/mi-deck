import { MfmText } from "@/features/mfm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUser } from "../hooks/useUser";

interface UserProfileProps {
  userId: string;
  origin: string;
  token: string;
}

export function UserProfile({ userId, origin, token }: UserProfileProps) {
  const { user, error, isLoading } = useUser(origin, token, userId);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  if (!user) {
    return <div className="p-4">User not found</div>;
  }

  return (
    <Card className="border-0 shadow-none rounded-none">
      <div className="relative h-24 w-full bg-muted">
        {user.bannerUrl && (
          <img
            src={user.bannerUrl}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <CardHeader className="relative pb-0 pt-10 px-4">
        <div className="absolute -top-10 left-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage
              src={user.avatarUrl || undefined}
              alt={user.name || user.username}
            />
            <AvatarFallback>
              {(user.name || user.username)?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <MfmText
              text={user.name || user.username}
              host={origin}
              emojis={user.emojis || {}}
            />
          </h1>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
        </div>
      </CardHeader>
      <CardContent className="mt-2 space-y-3 px-4 pb-4">
        {user.description && (
          <div className="text-sm">
            <MfmText
              text={user.description}
              host={origin}
              emojis={user.emojis || {}}
            />
          </div>
        )}

        <div className="flex gap-3 text-xs text-muted-foreground">
          <div>
            <span className="font-bold text-foreground">
              {user.followingCount}
            </span>{" "}
            Following
          </div>
          <div>
            <span className="font-bold text-foreground">
              {user.followersCount}
            </span>{" "}
            Followers
          </div>
          <div>
            <span className="font-bold text-foreground">{user.notesCount}</span>{" "}
            Notes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
