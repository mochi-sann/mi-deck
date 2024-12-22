import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

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
