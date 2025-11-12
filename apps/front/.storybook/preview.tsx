import type { Preview } from "@storybook/react-vite";
import { Providers } from "../src/providers";
import "../src/index.css"; // Import global CSS
import React from "react";

const preview: Preview = {
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
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
