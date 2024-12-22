import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../Component/auth/authContex";
import { $api } from "../../../lib/api/fetchClient";

type SignUpFormType = {
  email: string;
  password: string;
  usename: string;
};

export const SignUpForm: React.FC = () => {
  // 登録フォームを作成
  const { register, handleSubmit } = useForm<SignUpFormType>();
  const { login } = useContext(AuthContext);
  const { mutateAsync } = $api.useMutation("post", "/v1/auth/signUp");
  const navigate = useNavigate();
  const onSubmit = async (data: SignUpFormType) => {
    const SignUpResponse = await mutateAsync({
      body: {
        email: data.email,
        password: data.password,
        username: data.usename,
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
      <p>とうろく</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          ユーザー名
          <input type="text" {...register("usename")} />
        </label>
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
