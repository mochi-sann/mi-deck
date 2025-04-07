import { Button } from "@/Component/ui/button";
import type React from "react";
import { useLogout } from "../../../lib/configureAuth";

export const LogoutButton: React.FC = () => {
  const { mutateAsync } = useLogout();
  return (
    <Button onClick={mutateAsync} variant={"destructive"} buttonWidth={"full"}>
      ログアウト
    </Button>
  );
};
