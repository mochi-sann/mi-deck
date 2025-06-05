import { valibotResolver } from "@hookform/resolvers/valibot"; // 変更: valibotResolver をインポート
import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import * as v from "valibot"; // 変更: valibot をインポート
import { Button } from "./button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";

// 変更: Valibot を使用してスキーマを定義
const formSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(2, "Username must be at least 2 characters."),
  ),
  email: v.pipe(v.string(), v.email("Please enter a valid email address.")),
});

type FormValues = v.InferOutput<typeof formSchema>; // 変更: Valibot の型推論を使用

const meta: Meta<typeof Form> = {
  title: "UI/Form",
  component: Form,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Form>;

const FormExample = () => {
  const form = useForm<FormValues>({
    resolver: valibotResolver(formSchema), // 変更: valibotResolver を使用
    defaultValues: {
      username: "",
      email: "",
    },
  });

  function onSubmit(data: FormValues) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormDescription>
                We'll never share your email with anyone else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export const Default: Story = {
  render: () => <FormExample />,
};

export const WithError: Story = {
  render: () => {
    const form = useForm<FormValues>({
      resolver: valibotResolver(formSchema), // 変更: valibotResolver を使用
      defaultValues: {
        username: "a", // This will trigger an error
        email: "invalid-email", // This will trigger an error
      },
    });

    function onSubmit(data: FormValues) {
      console.log(data);
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  We'll never share your email with anyone else.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    );
  },
};
