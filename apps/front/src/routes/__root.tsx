import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Fragment } from "react";
import { NotFoundPage } from "@/components/parts/NotFoundPage";
import { Toaster } from "@/components/ui/toaster";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/router-devtools";

interface MyRouterContext {
  auth: {
    isAuth: boolean;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: NotFoundPage,
  component: () => (
    <Fragment>
      <Outlet />
      <Toaster />
      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
            defaultOpen: true,
          },
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
            defaultOpen: false,
          },
        ]}
      />
    </Fragment>
  ),
});
