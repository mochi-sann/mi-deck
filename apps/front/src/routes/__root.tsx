import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { link } from "styled-system/recipes";
import { css } from "../../styled-system/css";
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
        <Link to="/about" className={link()}>
          About
        </Link>{" "}
        <Link to="/login" className={link()}>
          login
        </Link>{" "}
        <Link to="/dassboard" className={link()}>
          dassboard
        </Link>
        <Link to="/add-server" className={link()}>
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
    </>
  ),
});
