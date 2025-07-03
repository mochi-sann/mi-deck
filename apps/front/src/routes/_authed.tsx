import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Layout } from "@/components/layout/Layout";

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
