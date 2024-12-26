import { useAuth } from "@/Component/auth/authContex";
import { Heading } from "@/Component/ui/heading";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LogoutButton } from "./-componets/LogoutButton";
import { LoginForm } from "./-form/LoginForm";
import { SignUpForm } from "./-form/SignUpForm";
export const LoginPageFallBack = "/" as const;

export const Route = createFileRoute("/login/")({
  component: Index,
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuth) {
      throw redirect({ to: search.redirect || LoginPageFallBack });
    }
  },
});

export function Index() {
  const { isAuth } = useAuth();
  return (
    <div className="p-2">
      <h3>Welcome login page!</h3>
      <div>
        <Heading as={"h1"}>ログアウトする</Heading>
        <LogoutButton />
      </div>
      <div>
        <Heading as={"h1"}>ログインする</Heading>
        <LoginForm />
        <hr />
        <SignUpForm />
      </div>
    </div>
  );
}
