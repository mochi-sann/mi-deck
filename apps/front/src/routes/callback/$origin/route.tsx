import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as v from "valibot";
import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useAuth } from "@/features/auth";
import {
  PENDING_AUTH_KEY_PREFIX,
  type PeendingAuthType,
} from "@/features/auth/api/clientAuth";

export const Route = createFileRoute("/callback/$origin")({
  validateSearch: v.object({
    session: v.fallback(v.string(), ""),
  }),
  component: AuthCallbackComponent,
});
function AuthCallbackComponent() {
  const { t } = useTranslation("auth");
  const { origin } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const auth = useAuth();

  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [error, setError] = useState<string | undefined>();
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }
    hasExecutedRef.current = true;
    const completeAuthentication = async () => {
      try {
        if (search.session === "") {
          throw new Error(t("callback.errors.noSessionToken"));
        }

        // Find pending auth session from localStorage
        let uuid: string | null = null;

        const pendingAuth =
          localStorage.getItem(PENDING_AUTH_KEY_PREFIX) || "{}";
        const PenndingAuthData: PeendingAuthType = JSON.parse(pendingAuth);
        uuid = PenndingAuthData.uuid;

        const result = await auth.completeAuth(uuid, search.session);

        if (result.success) {
          console.log("Authentication successful");
          setStatus("success");
          // Redirect to main app after success
          setTimeout(() => {
            navigate({ to: "/" });
          }, 2000);
        } else {
          // throw new Error(result.error || "Authentication failed");
        }
      } catch (err) {
        console.error("Auth callback failed:", err);
        setError(
          err instanceof Error ? err.message : t("callback.errors.authFailed"),
        );
        setStatus("error");
      }
    };

    completeAuthentication();
  }, [auth.completeAuth, navigate, search.session, t]);

  const handleRetry = () => {
    window.close(); // Close popup and let user try again
  };

  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 p-6">
      <div className="w-full space-y-4 text-center">
        {status === "processing" && (
          <div className="w-full">
            <Text className="text-lg">{t("callback.processing")}</Text>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-2">
            <Text className="text-green-600 text-lg">
              {t("callback.success.title")}
            </Text>
            <Text className="text-gray-600 text-sm">
              {t("callback.success.serverAdded", {
                serverName: decodeURIComponent(origin),
              })}
              <br />
              {t("callback.success.redirecting")}
            </Text>
          </div>
        )}

        {status === "error" && (
          <>
            <Text className="text-lg text-red-600">
              {t("callback.error.title")}
            </Text>
            {error && (
              <Text className="rounded bg-red-50 p-3 text-gray-600 text-sm">
                {error}
              </Text>
            )}
            <div className="flex justify-center space-x-4">
              <Button onClick={handleRetry} variant="outline">
                {t("callback.actions.retry")}
              </Button>
              <Button onClick={handleGoHome}>
                {t("callback.actions.goHome")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
