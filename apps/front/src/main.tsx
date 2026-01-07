import { createRoot } from "react-dom/client";
import "./index.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { registerSW } from "virtual:pwa-register";

import { useAuth } from "./features/auth";
import { Providers } from "./providers";
import { routeTree } from "./routeTree.gen";
import "./lib/i18n";

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
createRoot(document.getElementById("root")!).render(
  <Providers>
    <InnerApp />
  </Providers>,
);

registerSW({ immediate: true });
