/**
 * テキストが主に日本語（ひらがな、カタカナ、漢字）で構成されているかを判定する
 * @param text 判定対象のテキスト
 * @returns 日本語が主要言語の場合true
 */
export function isJapaneseText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // 日本語文字の正規表現（ひらがな、カタカナ、漢字）
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g;

  // 日本語文字を抽出
  const japaneseMatches = text.match(japaneseRegex);
  const japaneseCharCount = japaneseMatches ? japaneseMatches.length : 0;

  // 英数字以外の文字数をカウント（記号、URL構成要素を除外）
  const significantCharCount =
    text.replace(/[\s\W]/g, "").length + japaneseCharCount;

  // 日本語文字が有意な文字の20%以上を占める場合は日本語テキストと判定
  return (
    significantCharCount > 0 && japaneseCharCount / significantCharCount >= 0.2
  );
}

/**
 * テキストの言語に応じて適切なword-breakクラスを返す
 * @param text 対象のテキスト
 * @returns 適用すべきCSSクラス文字列
 */
export function getWordBreakClasses(text: string): string {
  const baseClasses = "break-words overflow-wrap-anywhere max-w-full";

  // 日本語テキストの場合はbreak-allを追加
  if (isJapaneseText(text)) {
    return `${baseClasses} break-all`;
  }

  return baseClasses;
}
