import type React from "react";
import { RecipeVariantProps, cva } from "../../../styled-system/css";

export type ButtonProps = {
  ComponentStyle?: RecipeVariantProps<typeof buttonStyle>;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = (props) => {
  return <button className={buttonStyle(props.ComponentStyle)} {...props} />;
};

export const buttonStyle = cva({
  base: {
    display: "flex",
    borderWidth: "1px",
    padding: 2,
    width: "100%",
    background: "blue.300",
    cursor: "pointer",
    color: "white",
    _hover: { bgColor: "blue.800", _dark: { bgColor: "blue.700" } },
    _focus: { shadow: "4", ring: "none", ringOffset: "none" },
    fontWeight: "bold",
    rounded: "lg",
    fontSize: "sm",
    lineHeight: "sm",
    animationDelay: "100ms",
    pl: "5",
    pr: "5",
    pt: "2.5",
    pb: "2.5",
    marginInlineEnd: "me.2",
    mb: "2",
    _dark: { bgColor: "blue.600" },
  },
  variants: {
    type: {
      default: { color: "white", backgroundColor: "blue.700" },
      danger: {
        color: "white",
        backgroundColor: "red.400",
        _hover: { bgColor: "red.500", _dark: { bgColor: "red.600" } },
      },
    },
    size: {
      small: { fontSize: "xs" },
      midium: { fontSize: "sm" },
      large: { fontSize: "md" },
    },
  },
  defaultVariants: {
    type: "default",
    size: "midium",
  },
});
