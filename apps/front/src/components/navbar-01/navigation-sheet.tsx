import { Button } from "@/Component/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/Component/ui/sheet";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";

export const NavigationSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Logo />
        <NavMenu menuLinks={[{ link: "#", name: "hoge" }]} />
      </SheetContent>
    </Sheet>
  );
};
