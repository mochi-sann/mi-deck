import { components } from "@/lib/api/type";
import type React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils"; // Import cn utility

export type ServerListProps = {
  serverInfo: components["schemas"]["CreateServerSessionResponseEntity"];
  onClick: (serverOrigin: string) => void;
};

export const ServerInfoBox: React.FC<ServerListProps> = (props) => {
  return (
    <div
      className={cn(
        "rounded border border-border p-2", // Use Tailwind classes for styling
      )}
    >
      <pre className="overflow-x-auto text-xs"> {/* Add basic styling for pre tag */}
        {JSON.stringify(props.serverInfo, null, 2)}
      </pre>
      <Button
        onClick={() => props.onClick(props.serverInfo.origin)}
        className="mt-2" // Add margin top to the button
      >
        サーバー情報を更新
      </Button>
    </div>
  );
};
