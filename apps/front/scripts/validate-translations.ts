#!/usr/bin/env tsx

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCALES_DIR = join(__dirname, "../src/locales");
const SUPPORTED_LOCALES = ["ja", "en"];

function flattenKeys(obj: TranslationObject, prefix = ""): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      keys.push(fullKey);
    } else if (typeof value === "object" && value !== null) {
      keys.push(...flattenKeys(value, fullKey));
    }
  }

  return keys;
}

function loadTranslations(locale: string): Record<string, string[]> {
  const localeDir = join(LOCALES_DIR, locale);
  const files = readdirSync(localeDir).filter((file) => file.endsWith(".json"));

  const translations: Record<string, string[]> = {};

  for (const file of files) {
    const namespace = file.replace(".json", "");
    const content = readFileSync(join(localeDir, file), "utf-8");
    const parsed = JSON.parse(content) as TranslationObject;
    translations[namespace] = flattenKeys(parsed);
  }

  return translations;
}

function validateTranslations() {
  console.log("🔍 Validating translations...\n");

  const allTranslations: Record<string, Record<string, string[]>> = {};

  // Load all translations
  for (const locale of SUPPORTED_LOCALES) {
    allTranslations[locale] = loadTranslations(locale);
  }

  let hasErrors = false;

  // Check that all locales have the same namespaces
  const baseLocale = SUPPORTED_LOCALES[0];
  const baseNamespaces = Object.keys(allTranslations[baseLocale]).sort();

  for (const locale of SUPPORTED_LOCALES.slice(1)) {
    const namespaces = Object.keys(allTranslations[locale]).sort();

    const missingNamespaces = baseNamespaces.filter(
      (ns) => !namespaces.includes(ns),
    );
    const extraNamespaces = namespaces.filter(
      (ns) => !baseNamespaces.includes(ns),
    );

    if (missingNamespaces.length > 0) {
      console.error(
        `❌ ${locale}: Missing namespaces: ${missingNamespaces.join(", ")}`,
      );
      hasErrors = true;
    }

    if (extraNamespaces.length > 0) {
      console.error(
        `❌ ${locale}: Extra namespaces: ${extraNamespaces.join(", ")}`,
      );
      hasErrors = true;
    }
  }

  // Check that all namespaces have the same keys
  for (const namespace of baseNamespaces) {
    const baseKeys = allTranslations[baseLocale][namespace]?.sort() || [];

    for (const locale of SUPPORTED_LOCALES.slice(1)) {
      const keys = allTranslations[locale][namespace]?.sort() || [];

      const missingKeys = baseKeys.filter((key) => !keys.includes(key));
      const extraKeys = keys.filter((key) => !baseKeys.includes(key));

      if (missingKeys.length > 0) {
        console.error(
          `❌ ${locale}:${namespace}: Missing keys: ${missingKeys.join(", ")}`,
        );
        hasErrors = true;
      }

      if (extraKeys.length > 0) {
        console.error(
          `❌ ${locale}:${namespace}: Extra keys: ${extraKeys.join(", ")}`,
        );
        hasErrors = true;
      }
    }
  }

  // Check for duplicate keys across namespaces
  for (const locale of SUPPORTED_LOCALES) {
    const allKeys = new Map<string, string[]>();

    for (const [namespace, keys] of Object.entries(allTranslations[locale])) {
      for (const key of keys) {
        if (!allKeys.has(key)) {
          allKeys.set(key, []);
        }
        allKeys.get(key)!.push(namespace);
      }
    }

    for (const [key, namespaces] of allKeys.entries()) {
      if (namespaces.length > 1) {
        console.warn(
          `⚠️  ${locale}: Duplicate key "${key}" found in: ${namespaces.join(", ")}`,
        );
      }
    }
  }

  if (hasErrors) {
    console.error("\n❌ Translation validation failed!");
    process.exit(1);
  } else {
    console.log("✅ All translations are valid!");

    // Print summary
    console.log("\n📊 Summary:");
    for (const locale of SUPPORTED_LOCALES) {
      const totalKeys = Object.values(allTranslations[locale]).reduce(
        (sum, keys) => sum + keys.length,
        0,
      );
      console.log(
        `  ${locale}: ${Object.keys(allTranslations[locale]).length} namespaces, ${totalKeys} keys`,
      );
    }
  }
}

// ESModule equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  validateTranslations();
}
