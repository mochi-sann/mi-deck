import { AuthContext } from "@/Component/auth/authContex";
import { Input } from "@/Component/ui/input";
import { Button } from "@/Component/ui/styled/button";
import { $api } from "@/lib/api/fetchClient";
import type React from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";

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
  const onSubmit = async (data: SignUpFormType) => {
    console.log("data", data);
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
        <label htmlFor="username">
          ユーザー名
          <Input
            type="text"
            required={true}
            placeholder="username"
            {...register("usename")}
          />
        </label>
        <label htmlFor="email">
          メールアドレス
          <Input
            type="email"
            required={true}
            placeholder="email"
            {...register("email")}
          />
        </label>
        <label htmlFor="password">
          パスワード
          <Input
            type="password"
            required={true}
            placeholder="password"
            {...register("password")}
          />
        </label>
        <Button variant={"danger"} buttonWidth={"full"} type="submit">
          登録
        </Button>
      </form>
    </div>
  );
};
