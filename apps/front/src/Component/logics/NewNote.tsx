import { zodResolver } from "@hookform/resolvers/zod";
import { $api } from "@/lib/api/fetchClient";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { APIClient } from "misskey-js/api.js";

// Define the form schema using Zod
const formSchema = z.object({
  serverSessionId: z.string({
    // biome-ignore lint/style/useNamingConvention:
    required_error: "投稿先サーバーを選択してください。",
  }),
  noteContent: z
    .string()
    .min(1, { message: "ノートの内容を入力してください。" }),
  // files: z.instanceof(FileList).optional(), // File handling needs careful consideration
});

type FormSchema = z.infer<typeof formSchema>;

export const NewNote = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
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
      serverSessionId: undefined, // Initialize as undefined
      noteContent: "",
    },
  });

  // Handle note submission including file uploads
  async function onSubmit(values: FormSchema) {
    setIsSubmitting(true); // Start submission process
    console.log("Form Submitted:", values);
    const client = new APIClient({
      origin:
        serverSessions?.find(
          (serverSession) => serverSession.id === values.serverSessionId,
        )?.origin || "",
      credential: serverSessions?.find(
        (serverSession) => serverSession.id === values.serverSessionId,
      )?.serverToken,
    });

    let uploadedFileIds: string[] = [];

    try {
      // Upload files if any are selected
      if (files.length > 0) {
        console.log("Uploading files:", files);
        // Use Promise.all to upload files concurrently
        const uploadPromises = files.map((file) =>
          client.request("drive/files/create", {
            file: file, // Pass the File object
            name: file.name, // Optional: use original filename
            // folderId: 'yourFolderId', // Optional: specify a folder
            // isSensitive: false,      // Optional: mark as sensitive
            // force: false,            // Optional: force overwrite
          }),
        );
        const uploadResults = await Promise.all(uploadPromises);
        uploadedFileIds = uploadResults.map((result) => result.id);
        console.log("Uploaded File IDs:", uploadedFileIds);
      }

      // Create the note with text and uploaded file IDs
      console.log("Creating note...");
      await client.request("notes/create", {
        text: values.noteContent,
        visibility: "public", // Adjust visibility as needed
        localOnly: false,
        fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined, // Attach file IDs
      });

      console.log("Note created successfully!");
      // TODO: Add success feedback (e.g., close dialog, show toast message)
      form.reset(); // Reset form fields
      setFiles([]); // Clear selected files
    } catch (err) {
      console.error("Error submitting note or uploading files:", err);
      // TODO: Add user-friendly error feedback (e.g., show toast message)
    } finally {
      setIsSubmitting(false); // End submission process
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

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

        {/* File Input (Still using useState for now) */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="picture">ファイルを選択</Label>
          <Input
            id="picture"
            className="w-full"
            type="file"
            multiple
            accept="image/*" // Only accept image files
            onChange={handleFileChange}
          />
          {/* Optionally display selected file names */}
          {files.length > 0 && (
            <div className="mt-2 text-muted-foreground text-sm">
              選択中のファイル: {files.map((file) => file.name).join(", ")}
            </div>
          )}
        </div>

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
