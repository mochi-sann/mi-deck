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
          <p className="text-muted-foreground text-sm">
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
            <h3 className="font-semibold text-lg">
              サーバーが選択されていません
            </h3>
            <p className="text-muted-foreground text-sm">
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
          <p className="text-muted-foreground text-sm">
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
        <h3 className="font-semibold text-lg">
          {currentServer.serverInfo?.name || currentServer.origin}
        </h3>
        <p className="text-muted-foreground text-sm">ホームタイムライン</p>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">ノートがありません</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                {note.user.avatarUrl && (
                  <img
                    src={note.user.avatarUrl}
                    alt={note.user.name || note.user.username}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-sm">
                    {note.user.name || note.user.username}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    @{note.user.username}
                  </p>
                </div>
              </div>
              {note.text && (
                <p className="whitespace-pre-wrap text-sm">{note.text}</p>
              )}
              <p className="text-muted-foreground text-xs">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
