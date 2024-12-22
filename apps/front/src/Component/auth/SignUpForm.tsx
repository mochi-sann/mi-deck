import type React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Input } from "../parts/Input";
type SignUpFormInput = {
  email: string;
  password: string;
};

export const SignUpForm: React.FC = () => {
  const { register, handleSubmit } = useForm<SignUpFormInput>();
  const onSubmit: SubmitHandler<SignUpFormInput> = (data) => {
    console.log(data);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>sigin form</p>
        <Input required {...register("email")} />
        <Input required {...register("password")} />
        <button type="submit">登録</button>
      </form>
    </div>
  );
};
