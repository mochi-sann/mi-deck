import { $api } from "@/lib/api/fetchClient";
import { uploadAndCompressFiles } from "@/lib/uploadAndCompresFiles";
import { valibotResolver } from "@hookform/resolvers/valibot"; //変更: valibotResolver をインポート
import { APIClient } from "misskey-js/api.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot"; // 変更: valibot をインポート
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
  serverSessionId: v.string([
    v.nonEmpty("投稿先サーバーを選択してください。"), // 変更: Valibot のバリデーション
  ]),
  noteContent: v.string([
    v.minLength(1, "ノートの内容を入力してください。"), // 変更: Valibot のバリデーション
  ]),
  isLocalOnly: v.boolean(), // 変更: Valibot の型
  visibility: v.enum_([
    "public",
    "home",
    "followers",
    "specified",
  ]), // 変更: Valibot の enum
});

const visibilityOptions = [
  { value: "public", label: "公開" },
  { value: "home", label: "ホーム" },
  { value: "followers", label: "フォロワー" },
  // { value: "specified", label: "指定ユーザー" }, // specified はUIが複雑になるため一旦除外
  { value: "private", label: "ダイレクト" }, // private はUIが複雑になるため一旦除外
] as const;
type FormSchema = v.InferOutput<typeof formSchema>; // 変更: Valibot の型推論

export const NewNote = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: serverSessions, isLoading: isLoadingServers } = $api.useQuery(
    "get",
    "/v1/server-sessions",
    {},
    {},
  );

  const form = useForm<FormSchema>({
    resolver: valibotResolver(formSchema), // 変更: valibotResolver を使用
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
      )?.serverToken || "";

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
                defaultValue={field.value}
                value={field.value}
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
                defaultValue={field.value}
                value={field.value}
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
