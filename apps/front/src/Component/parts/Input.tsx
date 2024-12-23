import type React from "react";
import { RecipeVariantProps, cva } from "../../../styled-system/css";

export type InputProps = {
  ComponentStyle?: RecipeVariantProps<typeof inputStyle>;
  placeholder: string;
  required: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = (props) => {
  // PandaCssを使ってInputComponentを作る
  return (
    <input
      className={inputStyle({
        type: props.ComponentStyle?.type,
        size: props.ComponentStyle?.size,
      })}
      {...props}
    />
  );
};

export const inputStyle = cva({
  base: {
    bgColor: "gray.50",
    borderWidth: "1px",
    borderColor: "gray.300",
    color: "gray.900",
    fontSize: "sm",
    lineHeight: "sm",
    rounded: "lg",
    _focus: { borderColor: "blue.500", _dark: { borderColor: "blue.500" } },
    display: "block",
    w: "full",
    p: "2.5",
    _dark: { bgColor: "gray.700", borderColor: "gray.600", color: "white" },

    padding: 2,
    width: "100%",
  },
  variants: {
    type: {
      default: { color: "gray.900" },
      danger: { color: "red", borderColor: "red" },
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
