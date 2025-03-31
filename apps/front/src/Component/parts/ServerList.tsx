import { components } from "@/lib/api/type";
import type React from "react";
import { box } from "styled-system/patterns";
import { Button } from "../ui/button";

export type ServerListProps = {
  serverInfo: components["schemas"]["CreateServerSessionResponseEntity"];
  onClick: (serverOrigin: string) => void;
};

export const ServerInfoBox: React.FC<ServerListProps> = (props) => {
  return (
    <div
      className={box({
        borderWidth: 1,
        borderColor: "gray.300",
        borderRadius: 4,
        p: 2,
      })}
    >
      <pre>{JSON.stringify(props.serverInfo, null, 2)}</pre>
      <Button onClick={() => props.onClick(props.serverInfo.origin)}>
        サーバー情報を更新
      </Button>
    </div>
  );
};
