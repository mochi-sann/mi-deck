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

// Define the form schema using Zod
const formSchema = z.object({
  serverSessionId: z.string({ required_error: "投稿先サーバーを選択してください。" }),
  noteContent: z.string().min(1, { message: "ノートの内容を入力してください。" }),
  // files: z.instanceof(FileList).optional(), // File handling needs careful consideration
});

type FormSchema = z.infer<typeof formSchema>;

export const NewNote = () => {
  const [files, setFiles] = useState<File[]>([]);
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

  // TODO: Implement actual note submission logic
  function onSubmit(values: FormSchema) {
    // 'values' contains validated form data
    console.log("Form Submitted:", values);
    console.log("Selected Server Session ID:", values.serverSessionId);
    console.log("Note Content:", values.noteContent);

    // Handle file uploads separately for now
    if (files.length > 0) {
      console.log("Selected files:", files);
      // TODO: Add actual file upload logic here, potentially combining with form data
    }

    // Example: Call API mutation here
    // mutation.mutate({ ...values, files });
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
          <DialogDescription>ノートの内容を入力してください。</DialogDescription>
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
          {/* Submit button is now part of the react-hook-form */}
          <Button type="submit">投稿</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
