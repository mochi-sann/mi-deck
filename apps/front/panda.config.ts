// import { ButtonRecipe } from "./src/Component/recipes/button";
import { defineConfig } from "@pandacss/dev";
import { recipes } from "./theme/recipe";

export default defineConfig({
  preflight: true,
  presets: [],

  include: ["./src/**/*.{ts,tsx,js,jsx}", "./pages/**/*.{ts,tsx,js,jsx}"],
  exclude: [],
  theme: {
    extend: {
      recipes: {
        ...recipes,
      },
      tokens: {
        fonts: {
          body: { value: "system-ui, sans-serif" },
          heading: { value: '"Avenir Next", sans-serif' },
        },
        colors: {
          text: { value: "#000" },
          background: { value: "#fff" },
          link: { value: "#07c" },
        },
      },
    },
  },
  outdir: "styled-system",
});
