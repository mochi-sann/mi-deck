/**
 * 環境変数を管理するクラス
 */
// biome-ignore lint/complexity/noStaticOnlyClass: 除外
export class EnvironmentConfig {
  private static _isLocalHttpEnabled: boolean | null = null;

  /**
   * ローカルHTTP接続が有効かどうかを判定
   * @returns 環境変数 VITE_ENABLE_LOCAL_HTTP が 'true' の場合 true
   */
  public static isLocalHttpEnabled(): boolean {
    if (EnvironmentConfig._isLocalHttpEnabled === null) {
      EnvironmentConfig._isLocalHttpEnabled =
        import.meta.env.VITE_ENABLE_LOCAL_HTTP === "true";
    }
    return EnvironmentConfig._isLocalHttpEnabled;
  }

  /**
   * テスト用：キャッシュをリセット
   */
  public static _resetCache(): void {
    EnvironmentConfig._isLocalHttpEnabled = null;
  }
}
