import type jaTranslations from "../../locales/ja";

export type TranslationResources = typeof jaTranslations;
export type TranslationKeys = keyof TranslationResources;
export type SupportedLanguage = "ja" | "en";

declare module "react-i18next" {
  interface CustomTypeOptions {
    // biome-ignore lint/style/useNamingConvention:
    defaultNS: "common";
    resources: TranslationResources;
  }
}
