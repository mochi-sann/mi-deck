import type React from "react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();
  const clicked = () => {
    console.log("clicked", !open);
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  // const [value, setValue, removeValue] = useLocalStorage("isSidebarOpen", true);
  return (
    <div className="m-0 flex h-svh w-dvw overscroll-none p-0 ">
      <AppSidebar />
      <Button
        className="fixed right-10 bottom-10 z-50 cursor-pointer rounded-full border-2 bg-green-400 px-2 py-5"
        onClick={clicked}
      >
        ボタン
      </Button>
      <div className="flex h-svh w-dvw flex-1 overflow-x-auto overflow-y-hidden ">
        <div>{props.children}</div>
      </div>
    </div>
  );
};
