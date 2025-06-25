import type { MisskeyServerConnection } from "@/lib/storage/types";
import { cn } from "@/lib/utils";
import type React from "react";
import { Button } from "../ui/button";

export type ServerListProps = {
  serverInfo: MisskeyServerConnection;
  onRefresh?: (serverId: string) => void;
  onRemove?: (serverId: string) => void;
  onSelect?: (serverId: string) => void;
  isSelected?: boolean;
};

export const ServerInfoBox: React.FC<ServerListProps> = (props) => {
  const { serverInfo, onRefresh, onRemove, onSelect, isSelected } = props;

  return (
    <div
      className={cn(
        "rounded border border-border p-4 transition-colors",
        isSelected ? "border-blue-300 bg-blue-50" : "hover:bg-gray-50",
      )}
    >
      {/* Server Info Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {serverInfo.serverInfo?.name || serverInfo.origin}
          </h3>
          {serverInfo.isActive && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs">
              Active
            </span>
          )}
        </div>

        <div className="text-gray-600 text-sm">
          <p>
            <strong>Origin:</strong> {serverInfo.origin}
          </p>
          {serverInfo.userInfo && (
            <p>
              <strong>User:</strong> @{serverInfo.userInfo.username}
            </p>
          )}
          {serverInfo.serverInfo?.version && (
            <p>
              <strong>Version:</strong> {serverInfo.serverInfo.version}
            </p>
          )}
        </div>

        {/* User Avatar and Info */}
        {serverInfo.userInfo && (
          <div className="flex items-center space-x-2">
            {serverInfo.userInfo.avatarUrl && (
              <img
                src={serverInfo.userInfo.avatarUrl}
                alt={serverInfo.userInfo.username}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div className="text-sm">
              <p className="font-medium">{serverInfo.userInfo.name}</p>
              <p className="text-gray-500">@{serverInfo.userInfo.username}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {onSelect && (
          <Button
            onClick={() => onSelect(serverInfo.id)}
            variant={isSelected ? "default" : "outline"}
            size="sm"
          >
            {isSelected ? "選択中" : "選択"}
          </Button>
        )}

        {onRefresh && (
          <Button
            onClick={() => onRefresh(serverInfo.id)}
            variant="outline"
            size="sm"
          >
            更新
          </Button>
        )}

        {onRemove && (
          <Button
            onClick={() => onRemove(serverInfo.id)}
            variant="destructive"
            size="sm"
          >
            削除
          </Button>
        )}
      </div>
    </div>
  );
};
