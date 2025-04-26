import { $api } from "@/lib/api/fetchClient";
import { uploadAndCompressFiles } from "@/lib/uploadAndCompresFiles";
import { zodResolver } from "@hookform/resolvers/zod";
import { APIClient } from "misskey-js/api.js";
import { useState } from "react";
import { useForm } from "react-hook-form"; // Import Resolver type
import { z } from "zod";
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

// Define the form schema using Zod
const formSchema = z.object({
  serverSessionId: z
    .string({
      // biome-ignore lint/style/useNamingConvention:
      required_error: "投稿先サーバーを選択してください。",
    })
    .nonempty({ message: "投稿先サーバーを選択してください。" }), // Add nonempty validation
  noteContent: z
    .string()
    .min(1, { message: "ノートの内容を入力してください。" }),
  isLocalOnly: z.boolean(), // Optional field for local-only notes
  visibility: z.enum(["public", "home", "followers", "specified"]),
});

const visibilityOptions = [
  { value: "public", label: "公開" },
  { value: "home", label: "ホーム" },
  { value: "followers", label: "フォロワー" },
  // { value: "specified", label: "指定ユーザー" }, // specified はUIが複雑になるため一旦除外
  { value: "private", label: "ダイレクト" }, // private はUIが複雑になるため一旦除外
] as const; // as const で value が string literal type になる
type FormSchema = z.infer<typeof formSchema>;

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
      serverSessionId: "", // Initialize as empty string instead of undefined
      noteContent: "",
      isLocalOnly: false, // Default to false
      visibility: "public", // Default visibility
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

      // Create the note with text and uploaded file IDs
      console.log("Creating note...");
      await client.request("notes/create", {
        text: values.noteContent,
        visibility: values.visibility, // Adjust visibility as needed
        localOnly: values.isLocalOnly,
        fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined, // Attach file IDs
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
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>公開範囲</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value} // Use defaultValue for initial render with Select
                value={field.value} // Controlled value
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
                  checked={field.value} // Controlled value
                  onCheckedChange={(checked) => field.onChange(checked)} // Update the form state
                  id="isLocalOnly" // Unique ID for the checkbox
                  // {...field}
                />
              </FormControl>
              <FormMessage />
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
