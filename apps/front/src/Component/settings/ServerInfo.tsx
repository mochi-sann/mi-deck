import { Button } from "@/Component/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Component/ui/card";
import { useStorage } from "@/lib/storage/context";

export function ServerInfo() {
  const storage = useStorage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>接続サーバー</CardTitle>
      </CardHeader>
      <CardContent>
        {storage.servers.length === 0 ? (
          <p className="text-muted-foreground">サーバーが登録されていません</p>
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
  );
}
