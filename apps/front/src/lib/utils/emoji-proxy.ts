import { toUrl } from "./url";

/**
 * 絵文字画像URLをMisskeyメディアプロキシ経由に変換する
 * @param originalUrl 元の絵文字画像URL
 * @param host Misskeyインスタンスのホスト
 * @returns プロキシ経由のURL
 */
export function createEmojiProxyUrl(originalUrl: string, host: string): string {
  if (!originalUrl || !host) return originalUrl;

  // 既にプロキシ経由の場合はそのまま返す
  if (originalUrl.includes("/proxy/emoji.webp")) {
    return originalUrl;
  }

  const baseUrl = toUrl(host);
  const encodedUrl = encodeURIComponent(originalUrl);

  return `${baseUrl}/proxy/emoji.webp?url=${encodedUrl}&emoji=1`;
}

/**
 * 絵文字オブジェクトの全URLをプロキシ経由に変換する
 * @param emojis 絵文字オブジェクト
 * @param host Misskeyインスタンスのホスト
 * @returns プロキシ経由のURLに変換された絵文字オブジェクト
 */
export function createProxiedEmojis(
  emojis: { [key: string]: string },
  host: string,
): { [key: string]: string } {
  if (!emojis || !host) return emojis;

  const proxiedEmojis: { [key: string]: string } = {};

  for (const [name, url] of Object.entries(emojis)) {
    proxiedEmojis[name] = createEmojiProxyUrl(url, host);
  }

  return proxiedEmojis;
}
