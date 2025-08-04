import { valibotResolver } from "@hookform/resolvers/valibot";
import { TFunction } from "i18next";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as v from "valibot";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStorage } from "@/lib/storage/context";

type ClientCreateTimelineDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const createFormSchema = (t: TFunction<"timeline", undefined>) =>
  v.object({
    serverId: v.pipe(
      v.string(),
      v.nonEmpty(t("createDialog.validation.selectServer")),
    ),
    type: v.union(
      [
        v.literal("home"),
        v.literal("local"),
        v.literal("social"),
        v.literal("global"),
      ],
      t("createDialog.validation.selectType"),
    ),
    name: v.pipe(
      v.string(t("createDialog.validation.enterName")),
      v.minLength(1),
    ),
  });

export function ClientCreateTimelineDialog({
  isOpen,
  onClose,
  onSuccess,
}: ClientCreateTimelineDialogProps) {
  const { t } = useTranslation("timeline");
  const storage = useStorage();

  const formSchema = useMemo(() => createFormSchema(t), [t]);
  type FormValues = v.InferOutput<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      serverId: "",
      type: "home",
      name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Get the next order number
      const maxOrder = Math.max(...storage.timelines.map((t) => t.order), -1);

      await storage.addTimeline({
        name: values.name,
        serverId: values.serverId,
        type: values.type,
        order: maxOrder + 1,
        isVisible: true,
        settings: {
          withReplies: false,
          withFiles: false,
          excludeNsfw: false,
        },
      });

      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Failed to create timeline:", error);
      alert(t("createDialog.createFailed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("createDialog.title")}</DialogTitle>
          <DialogDescription>{t("createDialog.description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="serverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("createDialog.serverLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={storage.isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("createDialog.serverPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storage.servers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          {server.serverInfo?.name ||
                            new URL(server.origin).hostname}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("createDialog.typeLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("createDialog.typePlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="home">
                        {t("createDialog.types.home")}
                      </SelectItem>
                      <SelectItem value="local">
                        {t("createDialog.types.local")}
                      </SelectItem>
                      <SelectItem value="social">
                        {t("createDialog.types.social")}
                      </SelectItem>
                      <SelectItem value="global">
                        {t("createDialog.types.global")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("createDialog.nameLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("createDialog.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={storage.isLoading}>
                {storage.isLoading
                  ? t("createDialog.creatingButton")
                  : t("createDialog.createButton")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
