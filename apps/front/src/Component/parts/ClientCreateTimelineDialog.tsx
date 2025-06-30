import { Button } from "@/Component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Component/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Component/ui/form";
import { Input } from "@/Component/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Component/ui/select";
import { useStorage } from "@/lib/storage/context";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import * as v from "valibot";

type ClientCreateTimelineDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const formSchema = v.object({
  serverId: v.pipe(v.string(), v.nonEmpty("サーバーを選択してください")),
  type: v.union(
    [
      v.literal("home"),
      v.literal("local"),
      v.literal("social"),
      v.literal("global"),
    ],
    "タイムラインタイプを選択してください",
  ),
  name: v.pipe(v.string("タイムライン名を入力してください"), v.minLength(1)),
});

type FormValues = v.InferOutput<typeof formSchema>;

export function ClientCreateTimelineDialog({
  isOpen,
  onClose,
  onSuccess,
}: ClientCreateTimelineDialogProps) {
  const storage = useStorage();

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
      alert("タイムラインの作成に失敗しました。");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいタイムラインを作成</DialogTitle>
          <DialogDescription>
            表示したいタイムラインの設定を行います。
          </DialogDescription>
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
                  <FormLabel>サーバー</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={storage.isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="サーバーを選択" />
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
                  <FormLabel>タイムラインタイプ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="タイムラインタイプを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="home">ホーム</SelectItem>
                      <SelectItem value="local">ローカル</SelectItem>
                      <SelectItem value="social">ソーシャル</SelectItem>
                      <SelectItem value="global">グローバル</SelectItem>
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
                  <FormLabel>タイムライン名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例: 私のホームタイムライン"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={storage.isLoading}>
                {storage.isLoading ? "作成中..." : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
