# 環境変数制御によるローカルHTTP接続実装計画

## 実装ステップ

### Step 1: 環境変数管理クラスの作成
**ファイル**: `apps/front/src/lib/config/environment.ts`

```typescript
/**
 * 環境変数を管理するクラス
 */
export class EnvironmentConfig {
  private static _isLocalHttpEnabled: boolean | null = null;
  
  /**
   * ローカルHTTP接続が有効かどうかを判定
   * @returns 環境変数 VITE_ENABLE_LOCAL_HTTP が 'true' の場合 true
   */
  public static isLocalHttpEnabled(): boolean {
    if (this._isLocalHttpEnabled === null) {
      this._isLocalHttpEnabled = import.meta.env.VITE_ENABLE_LOCAL_HTTP === 'true';
    }
    return this._isLocalHttpEnabled;
  }
  
  /**
   * テスト用：キャッシュをリセット
   */
  public static _resetCache(): void {
    this._isLocalHttpEnabled = null;
  }
}
```

### Step 2: ClientAuthManager の修正
**ファイル**: `apps/front/src/features/auth/api/clientAuth.ts`

#### 2-1: インポート追加
ファイル上部のインポート部分に追加：
```typescript
import { EnvironmentConfig } from "@/lib/config/environment";
```

#### 2-2: getProtocolFromOrigin メソッドの修正
既存の `getProtocolFromOrigin` メソッド（約28-42行目）を以下に置き換え：

```typescript
private getProtocolFromOrigin(origin: string): "http" | "https" {
  if (!origin || typeof origin !== "string") {
    return "https"; // フォールバック
  }
  
  const domain = origin.replace(/^https?:\/\//, "");
  
  // ローカルアドレス判定（IPv4、IPv6、localhost）
  const isLocalAddress = (
    domain.startsWith("localhost") ||
    domain.startsWith("127.0.0.1") ||
    domain.startsWith("::1") ||
    domain === "::1" ||
    domain.startsWith("[::1]") // IPv6ブラケット記法対応
  );
  
  // 環境変数でローカルHTTPが有効化されている場合のみHTTPを使用
  if (isLocalAddress && EnvironmentConfig.isLocalHttpEnabled()) {
    return "http";
  }
  
  return "https";
}
```

### Step 3: テストケースの追加
**ファイル**: `apps/front/src/features/auth/api/clientAuth.test.ts`

#### 3-1: インポート追加
```typescript
import { EnvironmentConfig } from "@/lib/config/environment";
```

#### 3-2: 新規テストケース追加
既存のテストの後に以下のテストケースを追加：

```typescript
describe("環境変数制御によるプロトコル判定", () => {
  beforeEach(() => {
    // テスト前にキャッシュをリセット
    EnvironmentConfig._resetCache();
  });

  afterEach(() => {
    // テスト後に環境変数をクリーンアップ
    vi.unstubAllEnvs();
  });

  test("環境変数未設定時はローカルアドレスでもHTTPS", () => {
    // 環境変数を未設定にする
    vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", undefined);
    
    const manager = new ClientAuthManager();
    expect((manager as any).getProtocolFromOrigin("localhost")).toBe("https");
    expect((manager as any).getProtocolFromOrigin("127.0.0.1")).toBe("https");
    expect((manager as any).getProtocolFromOrigin("::1")).toBe("https");
  });

  test("環境変数=true時はローカルアドレスでHTTP", () => {
    vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "true");
    
    const manager = new ClientAuthManager();
    expect((manager as any).getProtocolFromOrigin("localhost")).toBe("http");
    expect((manager as any).getProtocolFromOrigin("127.0.0.1")).toBe("http");
    expect((manager as any).getProtocolFromOrigin("::1")).toBe("http");
    expect((manager as any).getProtocolFromOrigin("[::1]")).toBe("http");
  });

  test("環境変数=false時はローカルアドレスでもHTTPS", () => {
    vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "false");
    
    const manager = new ClientAuthManager();
    expect((manager as any).getProtocolFromOrigin("localhost")).toBe("https");
    expect((manager as any).getProtocolFromOrigin("127.0.0.1")).toBe("https");
  });

  test("環境変数が無効な値の場合はHTTPS", () => {
    vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "TRUE"); // 大文字は無効
    
    const manager = new ClientAuthManager();
    expect((manager as any).getProtocolFromOrigin("localhost")).toBe("https");
    
    vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "1"); // 数字は無効
    EnvironmentConfig._resetCache(); // キャッシュリセット
    expect((manager as any).getProtocolFromOrigin("localhost")).toBe("https");
  });

  test("リモートアドレスは環境変数に関係なくHTTPS", () => {
    vi.stubEnv("VITE_ENABLE_LOCAL_HTTP", "true");
    
    const manager = new ClientAuthManager();
    expect((manager as any).getProtocolFromOrigin("example.com")).toBe("https");
    expect((manager as any).getProtocolFromOrigin("misskey.io")).toBe("https");
    expect((manager as any).getProtocolFromOrigin("192.168.1.100")).toBe("https");
  });
});
```

### Step 4: 型チェックとテスト実行
#### 4-1: TypeScript型チェック
```bash
pnpm run front -- typecheck
```

#### 4-2: テスト実行
```bash
pnpm run front -- test
```

#### 4-3: 特定テストファイルの実行
```bash
pnpm run front -- test -- clientAuth.test.ts
```

### Step 5: 環境変数設定例の追加
**ファイル**: `.env.example` または `.env.local.example`

以下の行を追加：
```
# ローカル開発用HTTPサーバー接続を有効にする（開発環境のみ）
VITE_ENABLE_LOCAL_HTTP=true
```

### Step 6: 統合テスト
#### 6-1: 環境変数なしでのビルド確認
```bash
pnpm build
```

#### 6-2: 環境変数ありでのテスト確認
```bash
VITE_ENABLE_LOCAL_HTTP=true pnpm run front -- test
```

## 実装時の注意点

### コード品質
- 既存のコードスタイルに合わせる
- TypeScriptの型安全性を維持
- エラーハンドリングを適切に行う

### テスト
- 既存テストが壊れないことを確認
- 環境変数の副作用がテスト間で影響しないよう適切にクリーンアップ
- エッジケースも含めて網羅的にテスト

### セキュリティ
- デフォルトはHTTPS接続を維持
- 環境変数の値検証を厳格に行う

### パフォーマンス
- 環境変数の読み取りは初回のみ
- 既存の処理速度に影響を与えない

## 完了条件
1. 全てのテストが通過する
2. TypeScript型チェックが通過する
3. ビルドが成功する
4. 既存機能に影響がない
5. 新機能が要件通りに動作する