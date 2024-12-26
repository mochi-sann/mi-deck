import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { useUser } from "./lib/configureAuth";
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
  const { data, status } = useUser();

  if (status === "pending" && !data) {
    return <div>Loading...</div>;
  }
  console.log(...[data, "👀 [main.tsx:25]: data"].reverse());
  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuth: data?.isAuth || false,
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
      <InnerApp />
    </QueryClientProvider>
  </StrictMode>,
);
