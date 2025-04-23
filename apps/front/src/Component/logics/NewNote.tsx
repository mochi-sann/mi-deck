import { $api } from "@/lib/api/fetchClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { APIClient } from "misskey-js/api.js";
import { DriveFilesCreateResponse } from "misskey-js/entities.js";
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
import { Textarea } from "../ui/textarea";
import { FileUpload } from "../parts/FileUpload"; // Import the new component

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
      serverSessionId: undefined, // Initialize as undefined
      noteContent: "",
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

    let uploadedFileIds: string[] = [];

    try {
      // Upload files if any are selected
      if (files.length > 0) {
        console.log("Uploading files:", files);
        // Use Promise.all to upload files concurrently
        const uploadPromises = files.map(async (file) => {
          const payload = new FormData();
          payload.append("i", serverToken);
          payload.append("file", file);
          return fetch(`${origin}/api/drive/files/create`, {
            method: "POST",
            body: payload,
            credentials: "omit",
            cache: "no-cache",
          }).then((res) => res.json());
        });
        const uploadResults: DriveFilesCreateResponse[] =
          await Promise.all(uploadPromises);
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
      setImagePreviews([]); // Clear previews // This line seems out of place now, remove if imagePreviews is gone
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
