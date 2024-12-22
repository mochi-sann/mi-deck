import type React from "react";
import { RecipeVariantProps, cva } from "../../../styled-system/css";

export type InputProps = {
  ComponentStyle?: RecipeVariantProps<typeof inputStyle>;
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
    display: "flex",
    borderWidth: "1px",
    borderColor: "gray",
    padding: 2,
    width: "100%",
  },
  variants: {
    type: {
      default: { color: "black" },
      danger: { color: "red", borderColor: "red" },
    },
    size: {
      small: { fontSize: "12px" },
      large: { fontSize: "16px" },
    },
  },
  defaultVariants: {
    type: "default",
    size: "large",
  },
});
