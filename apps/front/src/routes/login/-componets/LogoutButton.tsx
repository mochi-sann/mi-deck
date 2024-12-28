import type React from "react";
import { Button } from "../../../Component/ui/button";
import { useLogout } from "../../../lib/configureAuth";

export const LogoutButton: React.FC = () => {
  const { mutateAsync } = useLogout();
  return (
    <Button variant={"danger"} buttonWidth={"full"} onClick={mutateAsync}>
      ログアウト
    </Button>
  );
};
