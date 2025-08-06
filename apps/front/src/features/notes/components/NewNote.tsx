import { valibotResolver } from "@hookform/resolvers/valibot";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TFunction } from "i18next";
import { APIClient } from "misskey-js/api.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as v from "valibot";
import { FileUpload } from "@/components/parts/FileUpload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { storageManager } from "@/lib/storage";
import { uploadAndCompressFiles } from "@/lib/uploadAndCompresFiles";

// Define the form schema using Valibot
const createFormSchema = (t: TFunction<"notes", undefined>) =>
  v.object({
    serverSessionId: v.pipe(
      v.string(),
      v.nonEmpty(t("newNote.validation.selectServer")),
    ),
    noteContent: v.pipe(
      v.string(),
      v.minLength(1, t("newNote.validation.enterContent")),
    ),
    isLocalOnly: v.boolean(),
    visibility: v.picklist(
      ["public", "home", "followers", "specified"] as const,
      t("newNote.validation.selectVisibility"),
    ),
  });

export const NewNote = () => {
  const { t } = useTranslation("notes");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = createFormSchema(t);
  type FormSchema = v.InferOutput<typeof formSchema>;

  const visibilityOptions = [
    { value: "public", label: t("newNote.visibility.public") },
    { value: "home", label: t("newNote.visibility.home") },
    { value: "followers", label: t("newNote.visibility.followers") },
    { value: "specified", label: t("newNote.visibility.specified") },
  ] as const;
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
          <DialogTitle>{t("newNote.title")}</DialogTitle>
          <DialogDescription>{t("newNote.description")}</DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="serverSessionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("newNote.serverLabel")}</FormLabel>
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
                          ? t("newNote.serverLoading")
                          : t("newNote.serverPlaceholder")
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
              <FormLabel>{t("newNote.visibilityLabel")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value ?? "public")} // 変更: String() でキャスト、デフォルト値を指定
                value={String(field.value ?? "public")} // 変更: String() でキャスト、デフォルト値を指定
                disabled={isLoadingServers || !serverSessions}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t("newNote.visibilityPlaceholder")}
                    />
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
              <FormLabel>{t("newNote.localOnlyLabel")}</FormLabel>
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
              <FormLabel>{t("newNote.contentLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("newNote.contentPlaceholder")}
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
            {isSubmitting
              ? t("newNote.postingButton")
              : t("newNote.postButton")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
