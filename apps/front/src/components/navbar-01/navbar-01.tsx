import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { NavigationSheet } from "./navigation-sheet";

const Navbar01Page = () => {
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();
  const clicked = () => {
    console.log("clicked", !open);
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  return (
    <div className="">
      <nav className=" border-b bg-background">
        <div className="mx-auto flex items-center justify-between px-2 py-1">
          <Button variant={"outline"} size={"icon-sm"} onClick={clicked}>
            <Menu />
          </Button>
          k{" "}
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button>Get Started</Button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavigationSheet />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar01Page;
