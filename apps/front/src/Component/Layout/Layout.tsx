import type React from "react";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  // const [value, setValue, removeValue] = useLocalStorage("isSidebarOpen", true);
  return (
    <SidebarProvider>
      <div className="m-0 flex h-svh w-dvw overscroll-none p-0 ">
        <AppSidebar />
        <div className="flex h-svh w-dvw flex-1 overflow-x-auto overflow-y-hidden ">
          <div>{props.children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};
