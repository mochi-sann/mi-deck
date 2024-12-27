import { Heading } from "@/Component/ui/heading";
import { useUser } from "@/lib/configureAuth";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import * as v from "valibot";
import { LogoutButton } from "./-componets/LogoutButton";
import { LoginForm } from "./-form/LoginForm";
import { SignUpForm } from "./-form/SignUpForm";
export const LoginPageFallBack = "/" as const;

export const Route = createFileRoute("/login")({
  component: Index,
  validateSearch: v.object({
    redirect: v.optional(v.fallback(v.string(), "")),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuth) {
      throw redirect({ to: search.redirect || LoginPageFallBack });
    }
  },
});

export function Index() {
  return <Outlet />;
}
