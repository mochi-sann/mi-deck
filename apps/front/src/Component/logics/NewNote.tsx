import { $api } from "@/lib/api/fetchClient";
import { uploadAndCompressFiles } from "@/lib/uploadAndCompresFiles";
import { zodResolver } from "@hookform/resolvers/zod";
import { APIClient } from "misskey-js/api.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileUpload } from "../parts/FileUpload";
import { Button } from "../ui/button";
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
// import { Checkbox } from "../ui/checkbox"; // Shadcn/uiのCheckboxを使う場合はコメント解除

// Define the form schema using Zod
const formSchema = z.object({
  serverSessionId: z.string({
    // biome-ignore lint/style/useNamingConvention:
    required_error: "投稿先サーバーを選択してください。",
  }),
  noteContent: z
    .string()
    .min(1, { message: "ノートの内容を入力してください。" }),
  visibility: z
    .enum(["public", "home", "followers", "specified"], {
      // biome-ignore lint/style/useNamingConvention:
      required_error: "公開範囲を選択してください。",
    })
    .default("public"), // Default visibility
  localOnly: z.boolean().default(false), // ローカルのみの投稿かどうかのフラグ
  // files: z.instanceof(FileList).optional(), // File handling needs careful consideration
});

type FormSchema = z.infer<typeof formSchema>;

// Misskeyの公開範囲オプション
const visibilityOptions = [
  { value: "public", label: "公開" },
  { value: "home", label: "ホーム" },
  { value: "followers", label: "フォロワー" },
  // { value: "specified", label: "指定ユーザー" }, // specified はUIが複雑になるため一旦除外
] as const; // as const で value が string literal type になる

// Misskeyの公開範囲の型 (zod schemaから取得)
type VisibilityType = FormSchema["visibility"];

export const NewNote = () => {
  const [files, setFiles] = useState<File[]>([]); // State for selected files
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [selectedServerSessionId, setSelectedServerSessionId] = useState<
  //   string | undefined
  // >(undefined); // Managed by react-hook-form now

  const { data: serverSessions, isLoading: isLoadingServers } = $api.useQuery(
    "get",
    "/v1/server-sessions",
    {},
    {
      // Keep previous data while loading new server list if needed
      // placeholderData: keepPreviousData,
    },
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverSessionId: "", // Initialize as undefined
      noteContent: "",
      visibility: "public", // Default visibility
      localOnly: false,
    },
  });

  // Handle note submission including file uploads
  async function onSubmit(values: FormSchema) {
    setIsSubmitting(true); // Start submission process
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
      // Upload files using the helper function
      const uploadedFileIds = await uploadAndCompressFiles(
        files,
        origin,
        serverToken,
      );

      // Create the note with text, visibility, and uploaded file IDs
      console.log("Creating note...");
      await client.request("notes/create", {
        text: values.noteContent,
        fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined, // Attach file IDs
        visibility: values.visibility,
        localOnly: values.localOnly,
      });

      console.log("Note created successfully!");
      // TODO: Add success feedback (e.g., close dialog, show toast message)
      form.reset(); // Reset form fields
      setFiles([]); // Clear selected files
      // setImagePreviews([]); // This state is no longer here
    } catch (err) {
      console.error("Error submitting note or uploading files:", err);
      // TODO: Add user-friendly error feedback (e.g., show toast message)
    } finally {
      setIsSubmitting(false); // End submission process
    }
  }

  return (
    // Use the Form component from ui/form
    <Form {...form}>
      {/* Pass the form methods and onSubmit handler */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>新しいノートを作成</DialogTitle>
          <DialogDescription>
            ノートの内容を入力してください。
          </DialogDescription>
        </DialogHeader>

        {/* Server Selection Field */}
        <FormField
          control={form.control}
          name="serverSessionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>投稿先サーバー</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value} // Use defaultValue for initial render with Select
                value={field.value} // Controlled value
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
                      {/* TODO: Display a more user-friendly name if available, e.g., from serverInfo */}
                      {session.origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Visibility Selection Field */}
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>公開範囲</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value as VisibilityType)
                } // Cast value to VisibilityType
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="公開範囲を選択..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visibilityOptions.map((option) => (
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

        {/* Local Only Checkbox */}
        <FormField
          control={form.control}
          name="localOnly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                {/* Shadcn/uiのCheckboxを使う場合 */}
                {/* <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                /> */}
                {/* 標準のinput[type=checkbox]を使う場合 */}
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mt-1" // Tailwindで見た目を調整
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>ローカルのみ</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Note Content Field */}
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
                  {...field} // Spread field props (onChange, onBlur, value, name, ref)
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload Component */}
        <FileUpload files={files} onFilesChange={setFiles} />

        <DialogFooter>
          {/* Disable button while submitting */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "投稿"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
