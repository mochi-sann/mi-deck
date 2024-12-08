import type React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
type Inputs = {
  misskeyServerUrl: string;
};

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input required {...register("misskeyServerUrl")} />
        <button type="submit">登録</button>
      </form>
    </div>
  );
};
