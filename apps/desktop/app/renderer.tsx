import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import reactDom from "react-dom/client";
import { WindowContextProvider } from "../lib/window";
import appIcon from "../resources/build/icon.png";
import { useUser } from "./lib/configureAuth";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { SidebarProvider } from "./Component/ui/sidebar";

const queryClient = new QueryClient();

function App() {
  const { data: user } = useUser();

  const router = React.useMemo(
    () =>
      createRouter({
        routeTree,
        context: {
          auth: {
            isAuth: !!user?.isAuth,
          },
        },
      }),
    [user?.isAuth],
  );

  return <RouterProvider router={router} />;
}

reactDom.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <WindowContextProvider titlebar={{ title: "Mi-Deck", icon: appIcon }}>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <App />
        </SidebarProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WindowContextProvider>
  </React.StrictMode>,
);
