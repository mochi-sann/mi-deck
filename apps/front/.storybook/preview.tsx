import type { Preview } from "@storybook/react-vite";
import type { RequestHandler } from "msw";
import { setupWorker } from "msw/browser";
import { Providers } from "../src/providers";
import "katex/dist/katex.min.css";
import "mfm-react-render/style.css";
import "../src/index.css"; // Import global CSS

const mswWorker = typeof window !== "undefined" ? setupWorker() : null;
let isMswStarted = false;

const ensureMswWorker = () => {
  if (!mswWorker || isMswStarted) return;
  mswWorker.start({ onUnhandledRequest: "bypass" });
  isMswStarted = true;
};

const preview: Preview = {
  decorators: [
    (Story, context) => {
      ensureMswWorker();
      if (mswWorker) {
        const handlers = context.parameters?.msw?.handlers as
          | RequestHandler[]
          | undefined;
        mswWorker.resetHandlers();
        if (handlers?.length) {
          mswWorker.use(...handlers);
        }
      }

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
        light: { name: "light", value: "oklch(1 0 0)" }, // ライトテーマ用背景
        dark: { name: "dark", value: "oklch(0.129 0.042 264.695)" }, // ダークテーマ用背景
      },
    },

    docs: {
      codePanel: true,
    },
  },
};

export default preview;
