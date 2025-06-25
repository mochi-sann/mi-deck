import { Layout } from "@/Component/Layout/Layout";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: () => {
    // Allow access without authentication - users can add servers after entering
    // In the new client-side architecture, authentication is optional
    // Users can use the app and add Misskey servers as needed
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
