import "react-i18next";

import type { resources } from "../lib/i18n";

declare module "react-i18next" {
  interface CustomTypeOptions {
    // biome-ignore lint/style/useNamingConvention:
    defaultNS: "common";
    resources: typeof resources.ja;
  }
}
