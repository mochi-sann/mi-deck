import type { Preview } from "@storybook/react-vite";
import { Providers } from "../src/providers";
import "katex/dist/katex.min.css";
import "mfm-react-render/style.css";
import "../src/index.css"; // Import global CSS

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const isDark = context.globals.backgrounds?.value === "dark";
      const html = document.documentElement;
      if (isDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
      return (
        <Providers>
          <Story />
        </Providers>
      );
    },
  ],
  initialGlobals: {
    backgrounds: { value: "light" },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { name: "light", value: " oklch(1 0 0)" }, // ライトテーマ用背景
        dark: { name: "dark", value: "oklch(0.129 0.042 264.695)" }, // ダークテーマ用背景
      },
    },

    docs: {
      codePanel: true,
    },
  },
};

export default preview;
