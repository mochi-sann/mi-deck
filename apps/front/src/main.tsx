import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { AuthProvider, useAuth } from "./Component/auth/authContex";
import { AuthLoader } from "./lib/configureAuth";
import { routeTree } from "./routeTree.gen";
import { LoginForm } from "./routes/login/-form/LoginForm";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
});

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthLoader
        renderLoading={() => <div>Loading ...</div>}
        renderUnauthenticated={() => <LoginForm />}
      >
        <InnerApp />
      </AuthLoader>
    </QueryClientProvider>
  </StrictMode>,
);
