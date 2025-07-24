import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useAuth } from "@/features/auth";
import {
  PENDING_AUTH_KEY_PREFIX,
  type PeendingAuthType,
} from "@/features/auth/api/clientAuth";

export const Route = createLazyFileRoute("/callback/$origin")({
  component: AuthCallbackComponent,
});

function AuthCallbackComponent() {
  const { origin } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const auth = useAuth();

  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [error, setError] = useState<string | undefined>();

  // http://localhost:3000/callback/misskey.mochi33.com?session=56a8ff0a-bcfa-49fe-8104-398a8f52cfd2
  useEffect(() => {
    const completeAuthentication = async () => {
      try {
        console.log("Starting authentication with:", { origin, search });

        console.log(
          ...[
            { search, origin },
            "👀 [route.lazy.tsx:30]: {search , origin}",
          ].reverse(),
        );
        if (search.session === "") {
          throw new Error("セッショントークンが提供されていません");
        }

        // Find pending auth session from localStorage
        let uuid: string | null = null;
        const decodedOrigin = decodeURIComponent(origin);
        console.log(
          "Looking for pending auth session for origin:",
          decodedOrigin,
        );

        const pendingAuth =
          localStorage.getItem(PENDING_AUTH_KEY_PREFIX) || "{}";
        const PenndingAuthData: PeendingAuthType = JSON.parse(pendingAuth);
        uuid = PenndingAuthData.uuid;

        console.log(
          ...[
            PenndingAuthData,
            "👀 [route.lazy.tsx:55]: PenndingAuthData",
          ].reverse(),
        );
        if (!uuid) {
          throw new Error(
            `認証セッションが見つかりません (origin: ${decodedOrigin})`,
          );
        }

        console.log(
          "Completing auth with UUID:",
          uuid,
          "and session:",
          search.session,
        );
        const result = await auth.completeAuth(uuid, search.session);

        if (result.success) {
          console.log("Authentication successful");
          setStatus("success");
          // Redirect to main app after success
          setTimeout(() => {
            navigate({ to: "/" });
          }, 2000);
        } else {
          throw new Error(result.error || "Authentication failed");
        }
      } catch (err) {
        console.error("Auth callback failed:", err);
        setError(err instanceof Error ? err.message : "認証に失敗しました");
        setStatus("error");
      }
    };

    completeAuthentication();
  }, [search, origin, auth, navigate]);

  const handleRetry = () => {
    window.close(); // Close popup and let user try again
  };

  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-6">
      <div className="space-y-4 text-center">
        {status === "processing" && (
          <>
            <Text className="text-lg">認証処理中...</Text>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
          </>
        )}

        {status === "success" && (
          <>
            <Text className="text-green-600 text-lg">認証が完了しました！</Text>
            <Text className="text-gray-600 text-sm">
              サーバー「{decodeURIComponent(origin)}」が追加されました。
              <br />
              まもなくメイン画面に移動します...
            </Text>
          </>
        )}

        {status === "error" && (
          <>
            <Text className="text-lg text-red-600">認証に失敗しました</Text>
            {error && (
              <Text className="rounded bg-red-50 p-3 text-gray-600 text-sm">
                {error}
              </Text>
            )}
            <div className="flex space-x-4">
              <Button onClick={handleRetry} variant="outline">
                再試行
              </Button>
              <Button onClick={handleGoHome}>ホームに戻る</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
