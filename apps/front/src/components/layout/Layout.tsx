import type React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { AppSidebar } from "./AppSidebar";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  // const [value, setValue, removeValue] = useLocalStorage("isSidebarOpen", true);
  return (
    <ScrollArea className="m-0 flex h-svh w-dvw overscroll-none p-0">
      <AppSidebar />
      {props.children}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
