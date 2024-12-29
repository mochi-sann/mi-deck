import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Text } from "../Component/ui/text";
import { LogoutButton } from "./login/-componets/LogoutButton";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuth) {
      throw redirect({
        to: "/login",
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
    <div className="p-2 h-full">
      <h1>Authenticated Route</h1>
      <Text>This route's content is only visible to authenticated users.</Text>
      <ul className="py-2 flex gap-2">
        <li>
          <LogoutButton />
        </li>
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
