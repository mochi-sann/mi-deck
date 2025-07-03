import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";

import { SidebarProvider } from "../components/ui/sidebar";
import { AuthProvider } from "../features/auth";
import { StorageProvider } from "../lib/storage/context";
import { ThemeProvider } from "../lib/theme/context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <StorageProvider>
          <ThemeProvider>
            <AuthProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </AuthProvider>
          </ThemeProvider>
        </StorageProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
