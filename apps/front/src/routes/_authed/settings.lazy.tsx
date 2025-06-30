import { Button } from "@/Component/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Component/ui/card";
import { Label } from "@/Component/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Component/ui/select";
import { Separator } from "@/Component/ui/separator";
import { Switch } from "@/Component/ui/switch";
import { useStorage } from "@/lib/storage/context";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createLazyFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const storage = useStorage();

  const handleExportData = () => {
    const data = {
      servers: storage.servers,
      timelines: storage.timelines,
      currentServerId: storage.currentServerId,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mi-deck-settings-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    if (confirm("すべてのデータを削除しますか？この操作は元に戻せません。")) {
      // すべてのサーバーとタイムラインを削除
      const serverIds = storage.servers.map((s) => s.id);
      const timelineIds = storage.timelines.map((t) => t.id);

      try {
        // すべてのタイムラインを削除
        await Promise.all(timelineIds.map((id) => storage.deleteTimeline(id)));
        // すべてのサーバーを削除
        await Promise.all(serverIds.map((id) => storage.deleteServer(id)));
        // 現在のサーバーをクリア
        await storage.setCurrentServer(undefined);
      } catch (error) {
        console.error("データの削除に失敗しました:", error);
        alert("データの削除に失敗しました");
      }
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="font-bold text-2xl">設定</h1>
      </div>

      {/* アプリケーション設定 */}
      <Card>
        <CardHeader>
          <CardTitle>アプリケーション設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme-toggle">ダークモード</Label>
              <p className="text-muted-foreground text-sm">
                アプリの外観をダークテーマに切り替えます
              </p>
            </div>
            <Switch id="theme-toggle" />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>言語設定</Label>
            <Select defaultValue="ja">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* タイムライン設定 */}
      <Card>
        <CardHeader>
          <CardTitle>タイムライン設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>自動更新</Label>
              <p className="text-muted-foreground text-sm">
                タイムラインを自動的に更新します
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>画像の自動読み込み</Label>
              <p className="text-muted-foreground text-sm">
                ノートの画像を自動的に読み込みます
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>更新間隔</Label>
            <Select defaultValue="30">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10秒</SelectItem>
                <SelectItem value="30">30秒</SelectItem>
                <SelectItem value="60">1分</SelectItem>
                <SelectItem value="300">5分</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* サーバー情報 */}
      <Card>
        <CardHeader>
          <CardTitle>接続サーバー</CardTitle>
        </CardHeader>
        <CardContent>
          {storage.servers.length === 0 ? (
            <p className="text-muted-foreground">
              サーバーが登録されていません
            </p>
          ) : (
            <div className="space-y-4">
              {storage.servers.map((server) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {server.serverInfo?.iconUrl && (
                      <img
                        src={server.serverInfo.iconUrl}
                        className="h-8 w-8 rounded"
                        alt={server.serverInfo.name || server.origin}
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {server.serverInfo?.name || server.origin}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {server.origin}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {server.id === storage.currentServerId && (
                      <span className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs">
                        現在のサーバー
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => storage.deleteServer(server.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* データ管理 */}
      <Card>
        <CardHeader>
          <CardTitle>データ管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="mb-2 font-medium">データのエクスポート</h4>
              <p className="mb-3 text-muted-foreground text-sm">
                サーバー情報とタイムライン設定をJSONファイルとしてダウンロードします
              </p>
              <Button onClick={handleExportData} variant="outline">
                データをエクスポート
              </Button>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 font-medium text-destructive">
                データの削除
              </h4>
              <p className="mb-3 text-muted-foreground text-sm">
                すべてのサーバー情報とタイムライン設定を削除します（この操作は元に戻せません）
              </p>
              <Button onClick={handleClearData} variant="destructive">
                すべてのデータを削除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アプリ情報 */}
      <Card>
        <CardHeader>
          <CardTitle>アプリケーション情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>バージョン:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>ビルド日:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>接続サーバー数:</span>
              <span>{storage.servers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>タイムライン数:</span>
              <span>{storage.timelines.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
