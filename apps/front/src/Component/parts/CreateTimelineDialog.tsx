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
import { $api } from "@/lib/api/fetchClient";
import { components } from "@/lib/api/type";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import * as v from "valibot";

type CreateTimelineDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type ServerSessionEntity =
  components["schemas"]["CreateServerSessionResponseEntity"];

const formSchema = v.object({
  serverSessionId: v.string("サーバーを選択してください", [v.minLength(1)]), // エラーメッセージを第一引数に移動
  type: v.union(
    [v.literal("home"), v.literal("local"), v.literal("global")],
    "タイムラインタイプを選択してください",
  ),
  name: v.string("タイムライン名を入力してください", [v.minLength(1)]), // エラーメッセージを第一引数に移動
});

type FormValues = v.InferOutput<typeof formSchema>;

export function CreateTimelineDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateTimelineDialogProps) {
  const { data: serverSessions, status: serverSessionsStatus } = $api.useQuery(
    "get",
    "/v1/server-sessions",
    {},
  );
  const createTimelineMutation = $api.useMutation("post", "/v1/timeline");

  const form = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      serverSessionId: "",
      type: "home",
      name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createTimelineMutation.mutateAsync({
        body: {
          serverSessionId: values.serverSessionId,
          type: values.type.toUpperCase(),
          name: values.name,
        },
      });
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Failed to create timeline:", error);
      // エラーハンドリングをここに追加
    }
  };

  const typedServerSessions = serverSessions as
    | ServerSessionEntity[]
    | undefined;

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
              name="serverSessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>サーバー</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={serverSessionsStatus === "pending"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="サーバーを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typedServerSessions?.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {new URL(session.origin).hostname}
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
              <Button type="submit" disabled={createTimelineMutation.isPending}>
                {createTimelineMutation.isPending ? "作成中..." : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
