import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
type NavmenuProps = {
  menuLinks: {
    link: string;
    name: string;
  }[];
} & NavigationMenuProps;

export const NavMenu = (props: NavmenuProps) => {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        {props.menuLinks.map((item) => (
          <NavigationMenuItem key={item.link}>
            <NavigationMenuLink asChild>
              <a href={item.link}>{item.name}</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
