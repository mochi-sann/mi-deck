import { AlertCircle, RefreshCw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface I18nErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface I18nErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

export class I18nErrorBoundary extends Component<
  I18nErrorBoundaryProps,
  I18nErrorBoundaryState
> {
  constructor(props: I18nErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): I18nErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("I18n Error Boundary caught an error:", error, errorInfo);

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

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  isI18nError = (error: Error): boolean => {
    return (
      error.message.includes("i18next") ||
      error.message.includes("translation") ||
      error.message.includes("namespace") ||
      error.stack?.includes("i18next") ||
      error.stack?.includes("react-i18next") ||
      false
    );
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Only show I18n error UI if this is actually an i18n-related error
      if (this.isI18nError(this.state.error)) {
        return (
          <div className="mx-auto max-w-2xl p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Translation Error
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Translation System Error</AlertTitle>
                  <AlertDescription>
                    The translation system encountered an error. Some text may
                    not display correctly. Please try refreshing the page.
                  </AlertDescription>
                </Alert>

                {process.env.NODE_ENV === "development" && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">
                      Detailed error information (for development)
                    </summary>
                    <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>

                  <Button
                    onClick={this.handleReload}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // For non-i18n errors, re-throw to let other error boundaries handle them
      throw this.state.error;
    }

    return this.props.children;
  }
}

// Hook for programmatic error reporting
export const useI18nErrorReporting = () => {
  const reportI18nError = (error: Error, context?: string) => {
    console.error("I18n Error:", error, context ? `Context: ${context}` : "");

    // Report to monitoring service if available
    // biome-ignore lint/suspicious/noExplicitAny:
    if (typeof window !== "undefined" && (window as any).reportError) {
      // biome-ignore lint/suspicious/noExplicitAny:
      (window as any).reportError(error);
    }
  };

  return { reportI18nError };
};
