import { Button } from "@/Components/ui/button";
import Text from "@/Components/ui/text";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <Text variant="h1">認証ページ</Text>
      <div className="flex gap-4">
        <Button
          className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          onClick={() => navigate({ to: "/login" })}
        >
          ログイン
        </Button>
        <Button
          className="rounded bg-green-500 px-6 py-2 text-white hover:bg-green-600"
          onClick={() => navigate({ to: "/signup" })}
        >
          新規登録
        </Button>
      </div>
    </div>
  );
}
