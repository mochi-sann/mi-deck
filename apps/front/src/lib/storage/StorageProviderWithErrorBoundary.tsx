import { StorageErrorBoundary } from "@/Component/ErrorBoundary/StorageErrorBoundary";
import type { ReactNode } from "react";
import { StorageProvider } from "./context";

interface StorageProviderWithErrorBoundaryProps {
  children: ReactNode;
}

export function StorageProviderWithErrorBoundary({
  children,
}: StorageProviderWithErrorBoundaryProps) {
  const handleReset = () => {
    // Optionally reload the page for a complete reset
    if (typeof window !== "undefined") {
      // Clear any cached state and reload
      window.location.reload();
    }
  };

  return (
    <StorageErrorBoundary onReset={handleReset}>
      <StorageProvider>{children}</StorageProvider>
    </StorageErrorBoundary>
  );
}

export { useStorage } from "./context";
