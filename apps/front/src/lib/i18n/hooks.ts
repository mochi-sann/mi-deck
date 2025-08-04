import { useTranslation as useTranslationOriginal } from "react-i18next";
import type { TranslationKeys, TranslationResources } from "./types";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type ValidTranslationKey<T extends TranslationKeys> = NestedKeyOf<
  TranslationResources[T]
>;

export function useTypedTranslation<T extends TranslationKeys = "common">(
  ns?: T,
) {
  const { t: tOriginal, ...rest } = useTranslationOriginal(ns);

  // biome-ignore lint/suspicious/noExplicitAny: 無視
  function t<K extends ValidTranslationKey<T>>(key: K, options?: any): string {
    const result =
      ns && ns !== "common" && !key.includes(":")
        ? // biome-ignore lint/suspicious/noExplicitAny: 無視
          tOriginal(`${ns}:${key}` as any, options)
        : // biome-ignore lint/suspicious/noExplicitAny: 無視
          tOriginal(key as any, options);

    return typeof result === "string" ? result : String(result);
  }

  return { t, ...rest };
}

type AllTranslationKeys =
  | {
      [K in TranslationKeys]: `${K}:${ValidTranslationKey<K>}`;
    }[TranslationKeys]
  | ValidTranslationKey<"common">;

export function useGlobalTranslation() {
  const { t: tOriginal, ...rest } = useTranslationOriginal();

  // biome-ignore lint/suspicious/noExplicitAny: 無視
  function t<K extends AllTranslationKeys>(key: K, options?: any): string {
    // biome-ignore lint/suspicious/noExplicitAny: 無視
    const result = tOriginal(key as any, options);
    return typeof result === "string" ? result : String(result);
  }

  return { t, ...rest };
}

export { useTranslation } from "react-i18next";
