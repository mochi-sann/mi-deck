import type React from "react";
import { useForm } from "react-hook-form";
import { $api } from "../../../lib/api/fetchClient";

type LoginFormType = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  // ログインフォームを作成
  const { register, handleSubmit } = useForm<LoginFormType>();
  const { mutateAsync } = $api.useMutation("post", "/v1/auth/login");
  const onSubmit = async (data: LoginFormType) => {
    const SignUpResponse = await mutateAsync({
      body: {
        email: data.email,
        password: data.password,
      },
    })
      .then((res) => {
        console.log(res);
        return res;
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
    console.log(data, SignUpResponse);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        メールアドレス
        <input type="text" {...register("email")} />
      </label>
      <label>
        パスワード
        <input type="password" {...register("password")} />
      </label>
      <button type="submit">ログイン</button>
    </form>
  );
};
