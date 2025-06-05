import { Button } from "@/Components/ui/button";
import { useLogout } from "@/lib/configureAuth";
import type React from "react";

export const LogoutButton: React.FC = () => {
  const { mutateAsync } = useLogout();
  return (
    <Button onClick={mutateAsync} variant={"destructive"} buttonWidth={"full"}>
      ログアウト
    </Button>
  );
};
