import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { FormStyle } from "@/Component/forms/formStyle";
import { Heading } from "@/Component/ui/heading";
import { Button } from "@/Component/ui/styled/button";
import { useRegister } from "@/lib/configureAuth";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useForm } from "react-hook-form";
import { Route } from "../route.lazy";

type SignUpFormType = {
  email: string;
  password: string;
  username: string;
};

export const SignUpForm: React.FC = () => {
  // 登録フォームを作成
  const { handleSubmit, control } = useForm<SignUpFormType>();
  const { mutateAsync } = useRegister();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const onSubmit = async (data: SignUpFormType) => {
    console.log("data", data);
    const SignUpResponse = await mutateAsync({
      email: data.email,
      password: data.password,
      username: data.username,
    })
      .then((res) => {
        console.log(res);
        navigate({ to: search.redirect });
        return res;
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
    console.log(data, SignUpResponse);
  };

  return (
    <div>
      <Heading as="h2" size={"xl"}>
        登録
      </Heading>
      <form className={FormStyle} onSubmit={handleSubmit(onSubmit)}>
        <TextFieldSet
          placeholder="username"
          label="ユーザー名"
          type="username"
          control={control}
          name="username"
          validation="Please enter a valid username address"
          rules={{
            required: "Please enter a valid username address",
          }}
        />
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
        <Button variant={"danger"} buttonWidth={"full"} type="submit">
          登録
        </Button>
      </form>
    </div>
  );
};
