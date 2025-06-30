import { AlertCircle, RefreshCw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
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
      error.message.includes("Storage not initialized") ||
      error.message.includes("Database not initialized") ||
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

  getErrorMessage = (error: Error): string => {
    if (error.message.includes("Storage not initialized")) {
      return "ストレージの初期化に失敗しました。ページを再読み込みしてください。";
    }

    if (error.message.includes("Database not initialized")) {
      return "データベースの初期化に失敗しました。ブラウザの設定でIndexedDBが有効になっているか確認してください。";
    }

    if (error.name === "QuotaExceededError") {
      return "ストレージの容量が不足しています。ブラウザのデータを整理してください。";
    }

    if (error.name === "NotAllowedError") {
      return "ストレージへのアクセスが許可されていません。ブラウザの設定を確認してください。";
    }

    if (error.name === "SecurityError") {
      return "セキュリティ制限によりストレージにアクセスできません。HTTPSでアクセスしているか確認してください。";
    }

    return "ストレージでエラーが発生しました。しばらく待ってから再試行してください。";
  };

  getRecoveryAction = (error: Error): ReactNode => {
    const canRetry = this.state.retryCount < this.maxRetries;

    return (
      <div className="flex flex-col gap-2">
        {canRetry && (
          <Button
            onClick={this.handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            再試行 ({this.state.retryCount + 1}/{this.maxRetries})
          </Button>
        )}

        <Button
          variant="outline"
          onClick={this.handleReset}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          リセット
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
                  alert(
                    "ブラウザの開発者ツールでApplication > Storage > Clear storageを実行してください。",
                  );
                } catch (err) {
                  console.error("Failed to clear storage:", err);
                }
              }
            }}
          >
            ストレージをクリア
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

      // デフォルトのエラーUI
      return (
        <div className="p-4 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                ストレージエラー
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラーが発生しました</AlertTitle>
                <AlertDescription>
                  {this.getErrorMessage(this.state.error)}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === "development" && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">
                    詳細なエラー情報（開発用）
                  </summary>
                  <pre className="mt-2 overflow-auto bg-muted p-2 rounded text-xs">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 overflow-auto bg-muted p-2 rounded text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}

              {this.getRecoveryAction(this.state.error)}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const getErrorMessage = (error: Error): string => {
    if (error.message.includes("Storage not initialized")) {
      return "ストレージの初期化に失敗しました。ページを再読み込みしてください。";
    }

    if (error.message.includes("Database not initialized")) {
      return "データベースの初期化に失敗しました。ブラウザの設定でIndexedDBが有効になっているか確認してください。";
    }

    if (error.name === "QuotaExceededError") {
      return "ストレージの容量が不足しています。ブラウザのデータを整理してください。";
    }

    if (error.name === "NotAllowedError") {
      return "ストレージへのアクセスが許可されていません。ブラウザの設定を確認してください。";
    }

    if (error.name === "SecurityError") {
      return "セキュリティ制限によりストレージにアクセスできません。HTTPSでアクセスしているか確認してください。";
    }

    return "ストレージでエラーが発生しました。しばらく待ってから再試行してください。";
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            ストレージエラー
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            {retryCount < maxRetries && (
              <Button
                onClick={resetErrorBoundary}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                再試行 ({retryCount + 1}/{maxRetries})
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              ページを再読み込み
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
