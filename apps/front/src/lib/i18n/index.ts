import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enTranslations from "../../locales/en";
import jaTranslations from "../../locales/ja";

export const resources = {
  ja: jaTranslations,
  en: enTranslations,
} as const;

// biome-ignore lint/style/useNamingConvention: i18n library constant naming
export const defaultNS = "common";
export const fallbackLng = "ja";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNs: defaultNS,
    fallbackLng,
    lng: "ja", // デフォルト言語

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
