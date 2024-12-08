import type React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
type Inputs = {
  misskeyServerUrl: string;
};

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  console.log(watch("misskeyServerUrl"));

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);
  return (
    <div>
      <form action={handleSubmit(onSubmit)}>
        <input {...register("misskeyServerUrl")} />
        <button type="submit">登録</button>
      </form>
    </div>
  );
};
