/**
 * 絵文字関連の型定義
 */

/**
 * 絵文字のキャッシュ構造
 * ホストをキーとして、絵文字名と URL のマッピングを管理
 */
export type EmojiCache = Record<string, Record<string, string>>;

/**
 * 絵文字の取得結果
 * null の場合は取得に失敗または存在しない絵文字
 */
export type EmojiResult = Record<string, string | null>;

/**
 * 絵文字の基本情報
 */
export interface EmojiInfo {
  name: string;
  url: string | null;
}

/**
 * 絵文字の取得状態
 */
export interface EmojiState {
  isLoading: boolean;
  error: string | null;
  data: EmojiResult | null;
}

/**
 * カスタム絵文字のコンテキスト
 */
export interface CustomEmojiContext {
  host: string | null;
  emojis?: Record<string, string> | undefined;
}

/**
 * 絵文字の取得処理のキャッシュ
 * 同じ絵文字が同時に複数回リクエストされた場合の重複を防ぐ
 */
export type EmojiFetchCache = Record<string, Promise<string | null>>;

/**
 * 絵文字データベースのエントリ
 */
export interface EmojiCacheEntry {
  host: string;
  name: string;
  url: string;
}

/**
 * 絵文字のキャッシュ更新パラメータ
 */
export interface EmojiCacheUpdateParams {
  host: string;
  cache: Record<string, string | null>;
}
