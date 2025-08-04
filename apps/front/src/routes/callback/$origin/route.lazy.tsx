import { createLazyFileRoute } from "@tanstack/react-router";
import { ErrorState, ProcessingState, SuccessState } from "./-components";
import { useAuthCallback } from "./-hooks/useAuthCallback";

export const Route = createLazyFileRoute("/callback/$origin")({
  component: RouteComponent,
});

function RouteComponent() {
  const { origin } = Route.useParams();
  const search = Route.useSearch();

  const { status, error, handleRetry, handleGoHome } = useAuthCallback({
    sessionToken: search.session,
  });

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 p-6">
      <div className="w-full space-y-4 text-center">
        {status === "processing" && <ProcessingState />}
        {status === "success" && <SuccessState serverName={origin} />}
        {status === "error" && (
          <ErrorState
            error={error}
            onRetry={handleRetry}
            onGoHome={handleGoHome}
          />
        )}
      </div>
    </div>
  );
}
