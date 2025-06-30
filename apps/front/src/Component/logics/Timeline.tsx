import { useTimeline } from "@/Component/parts/timelines/hooks/useTimeline";
import { Alert, AlertDescription } from "@/Component/ui/alert";
import { LoadingSpinner } from "@/Component/ui/loading-spinner";
import { useStorage } from "@/lib/storage/context";
import { AlertCircle, Server } from "lucide-react";
import type React from "react";

export const Timeline: React.FC = () => {
  const {
    servers,
    currentServerId,
    isLoading: isStorageLoading,
  } = useStorage();

  const currentServer = servers.find((s) => s.id === currentServerId);

  const {
    notes,
    error,
    isLoading: isTimelineLoading,
  } = useTimeline(
    currentServer?.origin || "",
    currentServer?.accessToken || "",
    "home",
  );

  // Show loading state for storage initialization
  if (isStorageLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">
            ストレージを初期化中...
          </p>
        </div>
      </div>
    );
  }

  // Show message when no server is selected
  if (!currentServer) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Server className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              サーバーが選択されていません
            </h3>
            <p className="text-sm text-muted-foreground">
              サイドバーからサーバーを選択してください
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state for timeline data
  if (isTimelineLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">
            タイムラインを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            タイムラインの読み込みでエラーが発生しました: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {currentServer.serverInfo?.name || currentServer.origin}
        </h3>
        <p className="text-sm text-muted-foreground">ホームタイムライン</p>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">ノートがありません</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                {note.user.avatarUrl && (
                  <img
                    src={note.user.avatarUrl}
                    alt={note.user.name || note.user.username}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-sm">
                    {note.user.name || note.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{note.user.username}
                  </p>
                </div>
              </div>
              {note.text && (
                <p className="text-sm whitespace-pre-wrap">{note.text}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
