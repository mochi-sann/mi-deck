import type jaTranslations from "../../locales/ja";

export type TranslationResources = typeof jaTranslations;
export type TranslationKeys = keyof TranslationResources;

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[],
];

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number
          ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
          : never;
      }[keyof T]
    : "";

export type TranslationPath<T extends TranslationKeys> = Paths<
  TranslationResources[T]
>;

type AssertValidKey<
  T extends string,
  U extends TranslationKeys,
> = T extends TranslationPath<U> ? T : never;

// biome-ignore lint/style/useNamingConvention: 修正
export function createTypedTranslation<NS extends TranslationKeys>(
  _namespace: NS,
) {
  return <K extends TranslationPath<NS>>(key: AssertValidKey<K, NS>): string =>
    key;
}

export const testTypedTranslation = () => {
  const tCommon = createTypedTranslation("common");
  const tSettings = createTypedTranslation("settings");

  // 正しいキー
  tCommon("navigation.home"); // ✓
  tSettings("theme.title"); // ✓
  tCommon("loading"); // ✓

  // 間違ったキー（型エラーになるはず）
  // @ts-expect-error - このキーは存在しない
  tCommon("nonexistent.key");

  // @ts-expect-error - commonにはthemeセクションがない
  tCommon("theme.title");

  // @ts-expect-error - settingsにはnavigationセクションがない
  tSettings("navigation.home");

  // @ts-expect-error - このキーは存在しない
  tSettings("nonexistent.deeply.nested.key");
};
