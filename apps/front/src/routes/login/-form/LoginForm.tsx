import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { FormStyle } from "@/Component/forms/formStyle";
import { Button } from "@/Component/ui/button";
import { Heading } from "@/Component/ui/heading";
import { useLogin } from "@/lib/configureAuth";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useForm } from "react-hook-form";
import { Route } from "..";

type LoginFormType = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  // ログインフォームを作成
  const { handleSubmit, control } = useForm<LoginFormType>();
  const { mutateAsync } = useLogin();
  // const { mutateAsync } = $api.useMutation("post", "/v1/auth/login");
  const navigate = useNavigate();
  const search = Route.useSearch();
  const onSubmit = async (data: LoginFormType) => {
    const SignUpResponse = await mutateAsync({
      email: data.email,
      password: data.password,
    });
    console.log(SignUpResponse);
    console.log(
      ...[search.redirect, "👀 [LoginForm.tsx:41]: search.redirect"].reverse(),
    );
    await navigate({ to: search.redirect });
    // redirect({ to: search.redirect || LoginPageFallBack, throw: true });

    // })
    // .catch((err) => {
    //   console.log(err);
    //   return err;
    // });
    console.log(data, SignUpResponse);
  };

  return (
    <div>
      <Heading as="h2" size={"xl"}>
        ログイン
      </Heading>
      <form className={FormStyle} onSubmit={handleSubmit(onSubmit)}>
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
        <Button variant={"solid"} buttonWidth={"full"} type="submit">
          ログイン
        </Button>
      </form>
    </div>
  );
};
