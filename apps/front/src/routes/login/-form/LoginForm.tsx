import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../Component/auth/authContex";
import { $api } from "../../../lib/api/fetchClient";

type LoginFormType = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  // ログインフォームを作成
  const { register, handleSubmit } = useForm<LoginFormType>();
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
        navigate({
          to: "/",
        });
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
        <label>
          メールアドレス
          <input type="email" {...register("email")} />
        </label>
        <label>
          パスワード
          <input type="password" {...register("password")} />
        </label>
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
};
