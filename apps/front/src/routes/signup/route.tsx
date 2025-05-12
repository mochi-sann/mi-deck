import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import * as v from "valibot";
export const LoginPageFallBack = "/" as const;

export const Route = createFileRoute("/signup")({
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
