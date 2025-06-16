import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import reactDom from "react-dom/client";
import { WindowContextProvider, menuItems } from "../lib/window";
import appIcon from "../resources/build/icon.png";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

reactDom.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <WindowContextProvider
      titlebar={{ title: "Mi-Deck", icon: appIcon, menuItems }}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WindowContextProvider>
  </React.StrictMode>,
);
