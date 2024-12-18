import type React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
type SignUpFormInput = {
  email: string;
  password: string;
};

export const SignUpForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInput>();
  const onSubmit: SubmitHandler<SignUpFormInput> = (data) => {
    console.log(data);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>sigin form</p>
        <input required {...register("email")} />
        <input required {...register("password")} />
        <button type="submit">登録</button>
      </form>
    </div>
  );
};
