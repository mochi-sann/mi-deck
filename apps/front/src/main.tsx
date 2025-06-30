import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider, useAuth } from "./features/auth";
import { StorageProvider } from "./lib/storage/context";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: {
      isAuth: false,
    }, // This will be set after we wrap the app in an AuthProvider
  },
});

function InnerApp() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuth: auth.isAuthenticated,
        },
      }}
    />
  );
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StorageProvider>
        <AuthProvider>
          <SidebarProvider>
            <InnerApp />
          </SidebarProvider>
        </AuthProvider>
      </StorageProvider>
    </QueryClientProvider>
  </StrictMode>,
);
