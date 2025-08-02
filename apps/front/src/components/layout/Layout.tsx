import type React from "react";
import { AppSidebar } from "./AppSidebar";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  // const [value, setValue, removeValue] = useLocalStorage("isSidebarOpen", true);
  return (
    <div className="">
      <AppSidebar />

      <div>{props.children}</div>
    </div>
  );
};
