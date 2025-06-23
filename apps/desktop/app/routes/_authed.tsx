import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Layout } from "../Component/Layout/Layout";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuth) {
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div>
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
}
