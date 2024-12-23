import { Button } from "@/Component/ui/button";
import { Input } from "@/Component/ui/input";
import { $api } from "@/lib/api/fetchClient";
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
  const { register, handleSubmit } = useForm<LoginFormType>();
  const { login } = useContext(AuthContext);
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
        login(res.access_token);
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
      <p>ログイン</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">
          メールアドレス
          <Input
            placeholder="email"
            required={true}
            type="email"
            {...register("email")}
          />
        </label>
        <label htmlFor="password">
          パスワード
          <Input
            placeholder="password"
            required={true}
            type="password"
            {...register("password")}
          />
        </label>
        <Button type="submit">ログイン</Button>
      </form>
    </div>
  );
};
