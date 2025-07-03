import type { Preview } from "@storybook/react-vite";
import "../src/index.css"; // Import global CSS
import "@mi-deck/react-mfm/style.css";
import "katex/dist/katex.min.css"; // to support Formula

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    docs: {
      codePanel: true,
    },
  },
};

export default preview;
