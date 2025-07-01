import { AlertCircle, RefreshCw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StorageErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface StorageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class StorageErrorBoundary extends Component<
  StorageErrorBoundaryProps,
  StorageErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: StorageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<StorageErrorBoundaryState> {
    // ストレージ関連のエラーかどうかを判定
    const isStorageError =
      // Enhanced error detection from storage context
      error.name === "StorageError" ||
      (error as unknown as { isStorageError?: boolean }).isStorageError ===
        true ||
      // Legacy error detection
      error.message.includes("Storage not initialized") ||
      error.message.includes("Database not initialized") ||
      error.message.includes("Storage Error") ||
      error.message.includes("Failed to") ||
      error.name === "QuotaExceededError" ||
      error.name === "NotAllowedError" ||
      error.name === "SecurityError";

    if (isStorageError) {
      return {
        hasError: true,
        error,
      };
    }

    return {};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ストレージエラーのみをキャッチ
    if (this.state.hasError) {
      console.error(
        "Storage Error Boundary caught an error:",
        error,
        errorInfo,
      );
      this.setState({
        error,
        errorInfo,
      });
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

      // 親コンポーネントのリセット処理を呼び出し
      this.props.onReset?.();
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

  getErrorMessage = (error: Error, t: (key: string) => string): string => {
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

  getRecoveryAction = (
    error: Error,
    // biome-ignore lint/suspicious/noExplicitAny:
    t: (key: string, options?: any) => string,
  ): ReactNode => {
    const canRetry = this.state.retryCount < this.maxRetries;

    return (
      <div className="flex flex-col gap-2">
        {canRetry && (
          <Button
            onClick={this.handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("storageError.actions.retry", {
              current: this.state.retryCount + 1,
              max: this.maxRetries,
            })}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={this.handleReset}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t("storageError.actions.reset")}
        </Button>

        {error.name === "QuotaExceededError" && (
          <Button
            variant="secondary"
            onClick={() => {
              // ローカルストレージとIndexedDBをクリアする
              if (typeof window !== "undefined") {
                try {
                  localStorage.clear();
                  // IndexedDBのクリアは複雑なので、ユーザーに手動での操作を促す
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
    );
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // カスタムフォールバックが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // StorageErrorBoundaryWithTranslationを使用
      return (
        <StorageErrorBoundaryWithTranslation
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          getErrorMessage={this.getErrorMessage}
          getRecoveryAction={this.getRecoveryAction}
        />
      );
    }

    return this.props.children;
  }
}

// StorageErrorBoundaryWithTranslation - i18n対応のコンポーネント
interface StorageErrorBoundaryWithTranslationProps {
  error: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReset: () => void;
  getErrorMessage: (error: Error, t: (key: string) => string) => string;
  getRecoveryAction: (
    error: Error,
    // biome-ignore lint/suspicious/noExplicitAny:
    t: (key: string, options?: any) => string,
  ) => ReactNode;
}

const StorageErrorBoundaryWithTranslation = ({
  error,
  errorInfo,
  retryCount: _retryCount,
  maxRetries: _maxRetries,
  onRetry: _onRetry,
  onReset: _onReset,
  getErrorMessage,
  getRecoveryAction,
}: StorageErrorBoundaryWithTranslationProps) => {
  const { t } = useTranslation("common");

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
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>{getErrorMessage(error, t)}</AlertDescription>
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

          {getRecoveryAction(error, t)}
        </CardContent>
      </Card>
    </div>
  );
};

// エラーバウンダリをReactコンポーネントとして使用するためのラッパー
interface StorageErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export const StorageErrorFallback = ({
  error,
  resetErrorBoundary,
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
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            {retryCount < maxRetries && (
              <Button
                onClick={resetErrorBoundary}
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
              variant="outline"
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
