import { AlertCircle, RefreshCw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import { Component, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StorageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

interface StorageErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  maxRetries?: number;
}

export class StorageErrorBoundary extends Component<
  StorageErrorBoundaryProps,
  StorageErrorBoundaryState
> {
  private maxRetries: number;

  constructor(props: StorageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
    this.maxRetries = props.maxRetries ?? 3;
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<StorageErrorBoundaryState> {
    if (
      error.message.includes("storage") ||
      error.message.includes("Storage") ||
      error.message.includes("IndexedDB") ||
      error.message.includes("Database") ||
      error.name === "QuotaExceededError" ||
      error.name === "NotAllowedError" ||
      error.name === "SecurityError"
    ) {
      return { hasError: true, error };
    }

    // Non-storage errors should be handled by other error boundaries
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Storage Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to monitoring service if available
    // biome-ignore lint/suspicious/noExplicitAny:
    if (typeof window !== "undefined" && (window as any).reportError) {
      // biome-ignore lint/suspicious/noExplicitAny:
      (window as any).reportError(error);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <storageErrorUi
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// StorageErrorUI - Simplified error UI component
interface StorageErrorUiProps {
  error: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReset: () => void;
}

const storageErrorUi = ({
  error,
  errorInfo,
  retryCount,
  maxRetries,
  onRetry,
  onReset,
}: StorageErrorUiProps) => {
  const { t } = useTranslation("common");

  const getErrorMessage = useCallback(
    (error: Error): string => {
      if (error.message.includes("Storage not initialized")) {
        return t("storageError.messages.storageNotInitialized");
      }

      if (error.message.includes("Database not initialized")) {
        return t("storageError.messages.databaseNotInitialized");
      }

      if (error.name === "QuotaExceededError") {
        return t("storageError.messages.quotaExceeded");
      }

      if (error.name === "NotAllowedError") {
        return t("storageError.messages.notAllowed");
      }

      if (error.name === "SecurityError") {
        return t("storageError.messages.securityError");
      }

      return t("storageError.messages.general");
    },
    [t],
  );

  const canRetry = retryCount < maxRetries;

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {t("storageError.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>

          {process.env.NODE_ENV === "development" && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">
                {t("storageError.devInfo")}
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                {error.stack}
              </pre>
              {errorInfo && (
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                  {errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {canRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t("storageError.actions.retry", {
                  current: retryCount + 1,
                  max: maxRetries,
                })}
              </Button>
            )}

            <Button
              onClick={onReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("storageError.actions.reset")}
            </Button>

            {error.name === "QuotaExceededError" && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    confirm(
                      "ストレージをクリアします。データが失われますがよろしいですか？",
                    )
                  ) {
                    try {
                      localStorage.clear();
                      alert(t("storageError.clearStorageAlert"));
                    } catch (err) {
                      console.error("Failed to clear storage:", err);
                    }
                  }
                }}
              >
                {t("storageError.actions.clearStorage")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Component for programmatic error display (compatible with existing usage)
interface StorageErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  onReset?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export const StorageErrorFallback = ({
  error,
  onRetry,
  onReset,
  retryCount = 0,
  maxRetries = 3,
}: StorageErrorFallbackProps) => {
  const { t } = useTranslation("common");

  const getErrorMessage = (error: Error): string => {
    if (error.message.includes("Storage not initialized")) {
      return t("storageError.messages.storageNotInitialized");
    }

    if (error.message.includes("Database not initialized")) {
      return t("storageError.messages.databaseNotInitialized");
    }

    if (error.name === "QuotaExceededError") {
      return t("storageError.messages.quotaExceeded");
    }

    if (error.name === "NotAllowedError") {
      return t("storageError.messages.notAllowed");
    }

    if (error.name === "SecurityError") {
      return t("storageError.messages.securityError");
    }

    return t("storageError.messages.general");
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {t("storageError.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>

          <div className="flex gap-2">
            {onRetry && retryCount + 1 <= maxRetries && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t("storageError.actions.retry", {
                  current: retryCount + 1,
                  max: maxRetries,
                })}
              </Button>
            )}

            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("storageError.actions.reloadPage")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
