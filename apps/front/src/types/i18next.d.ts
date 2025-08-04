import "react-i18next";

import type { TranslationResources } from "../lib/i18n/types";

declare module "react-i18next" {
  interface CustomTypeOptions {
    // biome-ignore lint/style/useNamingConvention: react-i18next interface property naming
    defaultNS: "common";
    resources: TranslationResources;
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
    nsSeparator: ":";
    keySeparator: ".";
    // biome-ignore lint/style/useNamingConvention: react-i18next interface property naming
    allowObjectInHTMLChildren: false;
    interpolation: {
      escapeValue: false;
    };
  }
}
