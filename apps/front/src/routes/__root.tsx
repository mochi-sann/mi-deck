import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Fragment, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";

const TanStackRouterDevtools = !import.meta.env.DEV
  ? () => null // Render nothing in production
  : lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    );

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      // Lazy load in development
      import("@tanstack/react-query-devtools").then((res) => ({
        default: res.ReactQueryDevtools,
      })),
    )
  : () => null;

interface MyRouterContext {
  auth: {
    isAuth: boolean;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <Fragment>
      <Outlet />
      <Toaster />
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
      <Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </Fragment>
  ),
});
