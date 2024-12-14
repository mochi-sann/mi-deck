import type React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { MiAuthReq } from "../../lib/miAuth";
type Inputs = {
  misskeyServerUrl: string;
};

export const AddServerForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    const uuid = MiAuthReq(data.misskeyServerUrl);
    console.log(...[uuid, "👀 [LoginForm.tsx:18]: uuid"].reverse());
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
