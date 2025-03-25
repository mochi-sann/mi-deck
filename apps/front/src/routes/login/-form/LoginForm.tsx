import { Card } from "@/Component/ui/card";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import { TextFieldSet } from "../../../Component/forms/TextFieldSet";
import { FormStyle } from "../../../Component/forms/formStyle";
import { Button } from "../../../Component/ui/button";
import { Heading } from "../../../Component/ui/heading";
import { useLogin } from "../../../lib/configureAuth";
import { Route } from "../route.lazy";

type LoginFormType = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  // ログインフォームを作成
  const { handleSubmit, control } = useForm<LoginFormType>();
  const { mutateAsync } = useLogin();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const onSubmit = async (data: LoginFormType) => {
    try {
      await mutateAsync({
        email: data.email,
        password: data.password,
      });
      navigate({ to: search.redirect || '/' });
    } catch (error) {
      // Error is already handled by react-query-auth
      console.error('Login failed:', error);
    }
  };

  return (
    <Card.Root
      className={css({
        flex: 1,
      })}
    >
      <Card.Header>
        <Heading as="h2" size={"xl"}>
          ログイン
        </Heading>
      </Card.Header>
      <form className={FormStyle} onSubmit={handleSubmit(onSubmit)}>
        <Card.Body>
          <TextFieldSet
            placeholder="email"
            label="メールアドレス"
            type="email"
            control={control}
            name="email"
            validation="Please enter a valid email address"
            rules={{
              required: "Please enter a valid email address",
            }}
          />
          <TextFieldSet
            placeholder="password"
            label="パスワード"
            type="password"
            control={control}
            name="password"
            validation="Please enter a password"
            rules={{
              required: "pelase enter a password",
            }}
          />
        </Card.Body>
        <Card.Footer>
          <Button variant={"solid"} buttonWidth={"full"} type="submit">
            ログイン
          </Button>
        </Card.Footer>
      </form>
    </Card.Root>
  );
};
