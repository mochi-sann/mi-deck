import type React from "react";
import { useForm } from "react-hook-form";
import { $api } from "../../../lib/api/fetchClient";

type SignUpFormType = {
  email: string;
  password: string;
  usename: string;
};

export const SignUpForm: React.FC = () => {
  // 登録フォームを作成
  const { register, handleSubmit } = useForm<SignUpFormType>();
  const { mutateAsync } = $api.useMutation("post", "/v1/auth/signUp");
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
          <input type="text" {...register("email")} />
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
