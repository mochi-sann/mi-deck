import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStorage } from "@/lib/storage/context";

export function ApplicationInfo() {
  const storage = useStorage();

  return (
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
  );
}
