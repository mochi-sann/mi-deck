import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/Components/ui/card";
import Text from "@/Components/ui/text";
import { useAuthControllerLogin } from "@/lib/mideck/endpoints/auth/auth";
import type React from "react";
import { useForm } from "react-hook-form";
import { TextFieldSet } from "../../../Components/forms/TextFieldSet";
import { Button } from "../../../Components/ui/button";
import { Route } from "../route.lazy";

type LoginFormType = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  // ログインフォームを作成
  const { handleSubmit, control } = useForm<LoginFormType>();
  const { mutateAsync } = useAuthControllerLogin();
  // const navigate = useNavigate();
  const search = Route.useSearch();
  const onSubmit = async (data: LoginFormType) => {
    const SignUpResponse = await mutateAsync({
      data: {
        email: data.email,
        password: data.password,
      },
    });
    console.log(SignUpResponse);
    console.log(
      ...[search.redirect, "👀 [LoginForm.tsx:41]: search.redirect"].reverse(),
    );
    // navigate({ to: search.redirect || "/" });
    console.log(data, SignUpResponse);

    // window.location.reload();
  };

  return (
    <Card className={"flex"}>
      <CardHeader>
        <Text variant="h1">ログイン</Text>
      </CardHeader>
      <form
        className={"flex flex-1 flex-col gap-4"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <CardContent>
          <TextFieldSet
            placeholder="email"
            label="メールアドレス"
            type="email"
            control={control}
            name="email"
            validation="Please enter a valid email address"
            rules={{
              required: "Please enter a valid email address",
            }}
          />
          <TextFieldSet
            placeholder="password"
            label="パスワード"
            type="password"
            control={control}
            name="password"
            validation="Please enter a password"
            rules={{
              required: "pelase enter a password",
            }}
          />
        </CardContent>
        <CardFooter>
          <Button variant={"default"} buttonWidth={"full"} type="submit">
            ログイン
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
