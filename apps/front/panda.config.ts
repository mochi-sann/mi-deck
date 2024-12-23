import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";

export default defineConfig({
  // Whether to use css reset
  preflight: true,
  presets: [
    createPreset({
      accentColor: "blue",
      grayColor: "slate",
      borderRadius: "md",
    }),
  ],
  jsxFramework: "react", // or 'solid' or 'vue'

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
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

  // The output directory for your css system
  outdir: "styled-system",
});
