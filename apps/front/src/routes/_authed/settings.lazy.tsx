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
import { storageManager } from "@/lib/storage";
import { useStorage } from "@/lib/storage/context";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Download, Settings, Upload } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createLazyFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = await storageManager.exportData();

      const blob = new Blob([exportData], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mi-deck-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("データのエクスポートに失敗しました:", error);
      alert("データのエクスポートに失敗しました");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      await storageManager.importData(text);

      // Force refresh to update UI with new data
      window.location.reload();
    } catch (error) {
      console.error("データのインポートに失敗しました:", error);
      alert(
        `データのインポートに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearData = async () => {
    if (confirm("すべてのデータを削除しますか？この操作は元に戻せません。")) {
      try {
        await storageManager.clearAllData();
        // Force refresh to update UI
        window.location.reload();
      } catch (error) {
        console.error("データの削除に失敗しました:", error);
        alert("データの削除に失敗しました");
      }
    }
  };

  return (
    <div className="container mx-auto h-screen max-w-4xl space-y-6 p-6">
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
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <Download className="h-4 w-4" />
                データのエクスポート
              </h4>
              <p className="mb-3 text-muted-foreground text-sm">
                サーバー情報、タイムライン設定、認証状態をJSONファイルとしてダウンロードします
              </p>
              <Button
                onClick={handleExportData}
                variant="outline"
                disabled={isExporting}
              >
                {isExporting ? "エクスポート中..." : "データをエクスポート"}
              </Button>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <Upload className="h-4 w-4" />
                データのインポート
              </h4>
              <p className="mb-3 text-muted-foreground text-sm">
                以前にエクスポートしたJSONファイルからデータを復元します（既存のデータは上書きされます）
              </p>
              <Button
                onClick={handleImportClick}
                variant="outline"
                disabled={isImporting}
              >
                {isImporting ? "インポート中..." : "データをインポート"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 flex items-center gap-2 font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" />
                データの削除
              </h4>
              <p className="mb-3 text-muted-foreground text-sm">
                すべてのサーバー情報、タイムライン設定、認証状態を削除します（この操作は元に戻せません）
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
