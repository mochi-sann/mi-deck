# 環境変数制御によるローカルHTTP接続設計

## 設計概要
環境変数 `VITE_ENABLE_LOCAL_HTTP` を利用してローカルアドレスに対するHTTP/HTTPS接続を制御する機能を既存の `ClientAuthManager` に追加する。

## アーキテクチャ設計

### 環境変数読み取り機構
```typescript
class EnvironmentConfig {
  private static _isLocalHttpEnabled: boolean | null = null;
  
  public static isLocalHttpEnabled(): boolean {
    if (this._isLocalHttpEnabled === null) {
      this._isLocalHttpEnabled = import.meta.env.VITE_ENABLE_LOCAL_HTTP === 'true';
    }
    return this._isLocalHttpEnabled;
  }
}
```

### 既存コードの修正設計

#### ClientAuthManager クラスの修正
既存の `getProtocolFromOrigin` メソッドを以下のように修正：

```typescript
private getProtocolFromOrigin(origin: string): "http" | "https" {
  if (!origin || typeof origin !== "string") {
    return "https"; // フォールバック
  }
  
  const domain = origin.replace(/^https?:\/\//, "");
  
  // ローカルアドレス判定
  const isLocalAddress = (
    domain.startsWith("localhost") ||
    domain.startsWith("127.0.0.1") ||
    domain.startsWith("::1") ||
    domain === "::1" ||
    domain.startsWith("[::1]")
  );
  
  // 環境変数でローカルHTTPが有効化されている場合のみHTTPを使用
  if (isLocalAddress && EnvironmentConfig.isLocalHttpEnabled()) {
    return "http";
  }
  
  return "https";
}
```

## データフロー設計

```
1. ClientAuthManager.getProtocolFromOrigin() 呼び出し
2. EnvironmentConfig.isLocalHttpEnabled() で環境変数チェック
3. ローカルアドレス判定
4. 環境変数 = true AND ローカルアドレス → HTTP
5. それ以外 → HTTPS
```

## モジュール設計

### 新規追加ファイル
- `apps/front/src/lib/config/environment.ts` - 環境変数管理クラス

### 修正対象ファイル
- `apps/front/src/features/auth/api/clientAuth.ts` - プロトコル判定ロジック修正
- `apps/front/src/features/auth/api/clientAuth.test.ts` - テストケース追加

## インターフェース設計

### EnvironmentConfig クラス
```typescript
export class EnvironmentConfig {
  /**
   * ローカルHTTP接続が有効かどうかを判定
   * @returns 環境変数 VITE_ENABLE_LOCAL_HTTP が 'true' の場合 true
   */
  public static isLocalHttpEnabled(): boolean;
}
```

### 既存インターフェースへの影響
- `ClientAuthManager` の public インターフェースは変更なし
- 内部実装のみ修正

## エラーハンドリング設計

### 環境変数関連
- 環境変数が未定義の場合：`false` として扱う
- 環境変数が無効な値の場合：`false` として扱う
- 環境変数読み取りエラー：`false` として扱う（安全側に倒す）

### 既存エラーハンドリング
- 既存の null/undefined チェックは維持
- フォールバック動作は HTTPS 接続を維持

## セキュリティ設計

### 原則
- デフォルトはHTTPS接続（セキュア）
- HTTP接続は明示的な環境変数設定時のみ
- リモートサーバーは常にHTTPS

### 脅威モデル
- 環境変数の誤設定によるセキュリティ低下を防ぐ
- 開発環境以外での意図しないHTTP接続を防ぐ

## テスト設計

### 新規テストケース
1. 環境変数未設定時のプロトコル判定
2. 環境変数 = "true" 時のローカルアドレス処理
3. 環境変数 = "false" 時のローカルアドレス処理
4. 環境変数 = その他の値 時の処理
5. リモートアドレスの処理（環境変数に関係なくHTTPS）

### テスト環境の設定
- `vi.stubEnv()` を使用して環境変数をモック
- テスト間での環境変数状態のクリーンアップ

## パフォーマンス設計

### キャッシュ戦略
- 環境変数の値は初回読み取り時にキャッシュ
- アプリケーション実行中は変更されない前提

### 最適化
- 環境変数チェックは軽量操作
- 既存のローカルアドレス判定ロジックは維持