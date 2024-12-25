import { useAuth } from "@/Component/auth/authContex";
import { Button } from "@/Component/ui/button";
import type React from "react";

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  return (
    <Button variant={"danger"} onClick={logout}>
      ログアウト
    </Button>
  );
};
