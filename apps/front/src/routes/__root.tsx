import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Fragment, Suspense, lazy } from "react";
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

interface MyRouterContext {
  auth: {
    isAuth: boolean;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <Fragment>
      <Outlet />

      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    </Fragment>
  ),
});
