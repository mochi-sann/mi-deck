import { Button } from "@/Component/ui/button";
import Text from "@/Component/ui/text";
import { useAuth } from "@/lib/auth/context";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/auth/callback/$origin")({
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

  useEffect(() => {
    const completeAuthentication = async () => {
      try {
        if (!search.session) {
          throw new Error("No session token provided");
        }

        // Extract UUID from URL or generate one (MiAuth should provide it)
        const urlParams = new URLSearchParams(window.location.search);
        const uuid = urlParams.get("uuid") || crypto.randomUUID();

        const result = await auth.completeAuth(uuid, search.session);

        if (result.success) {
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
        setError(err instanceof Error ? err.message : "Authentication failed");
        setStatus("error");
      }
    };

    completeAuthentication();
  }, [search.session, origin, auth, navigate]);

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
