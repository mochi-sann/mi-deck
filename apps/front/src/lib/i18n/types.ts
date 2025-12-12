import type jaTranslations from "../../locales/ja";

export type TranslationResources = typeof jaTranslations;
export type TranslationKeys = keyof TranslationResources;
export type SupportedLanguage = "ja" | "en";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey<T extends TranslationKeys = TranslationKeys> =
  T extends keyof TranslationResources
    ? NestedKeyOf<TranslationResources[T]>
    : never;

type TranslationOptions = Record<string, unknown>;

export type AllTranslationKeys =
  | {
      [K in TranslationKeys]: `${K}:${TranslationKey<K>}`;
    }[TranslationKeys]
  | TranslationKey<"common">;

type ValidKeys<T extends TranslationKeys> = NestedKeyOf<
  TranslationResources[T]
>;

export type TypedTFunction<T extends TranslationKeys = "common"> =
  T extends "common"
    ? <K extends ValidKeys<"common">>(
        key: K,
        options?: TranslationOptions,
      ) => string
    : <K extends ValidKeys<T>>(key: K, options?: TranslationOptions) => string;

export type GlobalTFunction = <K extends AllTranslationKeys>(
  key: K,
  options?: TranslationOptions,
) => string;
