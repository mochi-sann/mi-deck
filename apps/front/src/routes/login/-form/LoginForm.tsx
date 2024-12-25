import { TextFieldSet } from "@/Component/forms/TextFieldSet";
import { FormStyle } from "@/Component/forms/formStyle";
import { Button } from "@/Component/ui/button";
import { Heading } from "@/Component/ui/heading";
import { $api } from "@/lib/api/fetchClient";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../Component/auth/authContex";

type LoginFormType = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  // ログインフォームを作成
  const { handleSubmit, control } = useForm<LoginFormType>();
  const { login } = useContext(AuthContext);
  const { mutateAsync } = $api.useMutation("post", "/v1/auth/login");
  const navigate = useNavigate();
  const onSubmit = async (data: LoginFormType) => {
    const SignUpResponse = await mutateAsync({
      body: {
        email: data.email,
        password: data.password,
      },
    })
      .then((res) => {
        console.log(res);
        login(res.access_token);
        navigate({ to: "/" });
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
