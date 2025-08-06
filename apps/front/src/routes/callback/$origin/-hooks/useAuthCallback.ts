import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth";
import {
  PENDING_AUTH_KEY_PREFIX,
  type PeendingAuthType,
} from "@/features/auth/api/clientAuth";

export type AuthCallbackStatus = "processing" | "success" | "error";

export interface UseAuthCallbackProps {
  sessionToken: string;
}

export interface UseAuthCallbackReturn {
  status: AuthCallbackStatus;
  error?: string;
  handleRetry: () => void;
  handleGoHome: () => void;
}

export function useAuthCallback({
  sessionToken,
}: UseAuthCallbackProps): UseAuthCallbackReturn {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const auth = useAuth();

  const [status, setStatus] = useState<AuthCallbackStatus>("processing");
  const [error, setError] = useState<string | undefined>();
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }
    hasExecutedRef.current = true;

    const completeAuthentication = async () => {
      try {
        if (sessionToken === "") {
          throw new Error(t("callback.errors.noSessionToken"));
        }

        // Find pending auth session from localStorage
        let uuid: string | null = null;

        const pendingAuth =
          localStorage.getItem(PENDING_AUTH_KEY_PREFIX) || "{}";
        const PenndingAuthData: PeendingAuthType = JSON.parse(pendingAuth);
        uuid = PenndingAuthData.uuid;

        const result = await auth.completeAuth(uuid, sessionToken);

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
  }, [auth.completeAuth, navigate, sessionToken, t]);

  const handleRetry = () => {
    window.close(); // Close popup and let user try again
  };

  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  return {
    status,
    error,
    handleRetry,
    handleGoHome,
  };
}
