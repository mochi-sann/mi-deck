import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Layout } from "../Component/Layout/Layout";
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
    <>
      <div className={"display-flex gap-2 p-1"}>
        <Link to="/">Home</Link> <Link to="/about">About</Link>{" "}
        <Link to="/login">login</Link> <Link to="/dashboard">dashboard</Link>
        <Link to="/add-server">add-server</Link>
        <Link to="/create-timeline">Create Timeline</Link>
      </div>
      <hr />
      <Layout>
        <Outlet />
      </Layout>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
});
