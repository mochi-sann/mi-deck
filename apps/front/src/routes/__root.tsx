import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Fragment, Suspense, lazy } from "react";
import { NotFoundPage } from "@/components/parts/NotFoundPage";
import { Toaster } from "@/components/ui/toaster";

const AppDevtools = import.meta.env.DEV
  ? lazy(() => import("./-devtools/AppDevtools"))
  : null;

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
      {AppDevtools ? (
        <Suspense fallback={null}>
          <AppDevtools />
        </Suspense>
      ) : null}
    </Fragment>
  ),
});
