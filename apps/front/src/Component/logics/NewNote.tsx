import { storageManager } from "@/lib/storage";
import { uploadAndCompressFiles } from "@/lib/uploadAndCompresFiles";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useSuspenseQuery } from "@tanstack/react-query";
import { APIClient } from "misskey-js/api.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { FileUpload } from "../parts/FileUpload";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

// Define the form schema using Valibot
const formSchema = v.object({
  serverSessionId: v.pipe(
    v.string(), // 変更: v.pipe を使用
    v.nonEmpty("投稿先サーバーを選択してください。"),
  ),
  noteContent: v.pipe(
    v.string(), // 変更: v.pipe を使用
    v.minLength(1, "ノートの内容を入力してください。"),
  ),
  isLocalOnly: v.boolean(),
  visibility: v.picklist(
    ["public", "home", "followers", "specified"] as const, // 変更: v.picklist を使用し、エラーメッセージのスキーマに合わせる
    "公開範囲を選択してください。", // エラーメッセージを追加
  ),
});

const visibilityOptions = [
  { value: "public", label: "公開" },
  { value: "home", label: "ホーム" },
  { value: "followers", label: "フォロワー" },
  { value: "specified", label: "指定ユーザー" }, // 変更: スキーマに合わせてコメントアウトを解除
] as const;
type FormSchema = v.InferOutput<typeof formSchema>;

export const NewNote = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getAllServersFn = () => {
    return storageManager.getAllServers();
  };

  const { data: serverSessions, isLoading: isLoadingServers } =
    useSuspenseQuery({
      queryKey: ["getAllServers"],
      queryFn: getAllServersFn,
    });

  const form = useForm<FormSchema>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      serverSessionId: "",
      noteContent: "",
      isLocalOnly: false,
      visibility: "public",
    },
  });

  async function onSubmit(values: FormSchema) {
    setIsSubmitting(true);
    console.log("Form Submitted:", values);
    const origin =
      serverSessions?.find(
        (serverSession) => serverSession.id === values.serverSessionId,
      )?.origin || "";
    const serverToken =
      serverSessions?.find(
        (serverSession) => serverSession.id === values.serverSessionId,
      )?.accessToken || "";

    const client = new APIClient({
      origin: origin,
      credential: serverToken,
    });

    try {
      const uploadedFileIds = await uploadAndCompressFiles(
        files,
        origin,
        serverToken,
      );

      await client.request("notes/create", {
        text: values.noteContent,
        visibility: values.visibility,
        localOnly: values.isLocalOnly,
        fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
      });

      console.log("Note created successfully!");
      form.reset();
      setFiles([]);
    } catch (err) {
      console.error("Error submitting note or uploading files:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>新しいノートを作成</DialogTitle>
          <DialogDescription>
            ノートの内容を入力してください。
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="serverSessionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>投稿先サーバー</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value ?? "")} // 変更: String() でキャスト
                value={String(field.value ?? "")} // 変更: String() でキャスト
                disabled={isLoadingServers || !serverSessions}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingServers
                          ? "サーバーを読み込み中..."
                          : "サーバーを選択..."
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serverSessions?.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>公開範囲</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value ?? "public")} // 変更: String() でキャスト、デフォルト値を指定
                value={String(field.value ?? "public")} // 変更: String() でキャスト、デフォルト値を指定
                disabled={isLoadingServers || !serverSessions}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={"公開範囲を選択"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visibilityOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isLocalOnly"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormLabel>ローカルのみ</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  id="isLocalOnly"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="noteContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ノート内容</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ここにノートの内容を入力..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FileUpload files={files} onFilesChange={setFiles} />

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "投稿"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
