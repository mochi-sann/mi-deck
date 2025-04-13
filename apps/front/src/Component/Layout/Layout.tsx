import type React from "react";
import { useLocalStorage } from "usehooks-ts";
import { SidebarProvider } from "../ui/sidebar";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const [value, setValue, removeValue] = useLocalStorage(
    "isSidebarOpen",
    false,
  );
  return (
    <SidebarProvider defaultOpen={value}>
      <div className="m-0 flex h-svh w-dvw overscroll-none p-0 ">
        <div className="h-full w-[80px] flex-[0_0_80px] bg-blue-50">
          <p>side menu</p>
        </div>
        <div className="flex h-svh w-dvw flex-1 overflow-x-auto overflow-y-hidden ">
          <div>{props.children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};
