import { Layout } from "@/Component/Layout/Layout";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { link } from "styled-system/recipes";
import { css } from "../../styled-system/css";
import { AuthContextType } from "../Component/auth/authContex";

const TanStackRouterDevtools = import.meta.env.DEV
  ? () => null // Render nothing in production
  : lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    );
const TanstackReactQueryDevtools = import.meta.env.DEV
  ? () => null // Render nothing in production
  : lazy(() =>
      // Lazy load in development
      import("@tanstack/react-query-devtools").then((res) => ({
        default: res.ReactQueryDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    );

interface MyRouterContext {
  auth: AuthContextType;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <div
        className={css({
          display: "flex",
          gap: "8px",
          padding: 1,
        })}
      >
        <Link to="/" className={link()}>
          Home
        </Link>{" "}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>{" "}
        <Link to="/login" className="[&.active]:font-bold">
          login
        </Link>{" "}
        <Link to="/dassboard" className="[&.active]:font-bold">
          dassboard
        </Link>
        <Link to="/add-server" className="[&.active]:font-bold">
          add-server
        </Link>
      </div>
      <hr />
      <Layout>
        <Outlet />
      </Layout>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
      <Suspense>
        <TanstackReactQueryDevtools />
      </Suspense>
    </>
  ),
});
