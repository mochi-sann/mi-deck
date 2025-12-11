# 絵文字機能テスト

このディレクトリには、絵文字機能のテストが含まれています。

## テストファイル

### 1. ユーティリティ関数のテスト

- `src/lib/utils/emoji-proxy.test.ts` - 絵文字プロキシユーティリティ関数のテスト
- `src/hooks/useForeignApi.test.ts` - 外部API呼び出しフックのテスト

### 2. コンポーネントのテスト

- `src/features/emoji/components/EmojiImg.test.tsx` - 絵文字画像コンポーネントのテスト
- `src/features/emoji/components/CustomEmoji.test.tsx` - カスタム絵文字コンポーネントのテスト
- `src/features/timeline/components/MisskeyNote.test.tsx` - Misskeyノートコンポーネントのテスト

### 3. データベースのテスト

- `src/lib/database/emoji-cache-database.test.ts` - 絵文字キャッシュデータベースのテスト

## テストの実行方法

### 全テストの実行

```bash
pnpm test
```

### 個別テストの実行

```bash
# 絵文字プロキシ関数のテスト
npx vitest run src/lib/utils/emoji-proxy.test.ts

# 絵文字コンポーネントのテスト
npx vitest run src/features/emoji/components/EmojiImg.test.tsx

# MisskeyNoteコンポーネントのテスト
npx vitest run src/features/timeline/components/MisskeyNote.test.tsx
```

## テストカバレッジ

作成されたテストは以下の機能をカバーしています：

### 絵文字プロキシ (`emoji-proxy.test.ts`)

- ✅ 基本的なプロキシURL生成
- ✅ 異なるホスト形式の処理
- ✅ 既にプロキシ済みURLの処理
- ✅ エラーハンドリング（空の値、特殊文字）
- ✅ 絵文字オブジェクトの一括変換

### 絵文字画像コンポーネント (`EmojiImg.test.tsx`)

- ✅ URLがある場合の画像表示
- ✅ URLがない場合のテキストフォールバック
- ✅ 空の値や特殊文字の処理
- ✅ 適切なCSSクラスの適用

### カスタム絵文字コンポーネント (`CustomEmoji.test.tsx`)

- ✅ コンテキストプロバイダーの動作
- ✅ ホストと絵文字データの処理
- ✅ 文字列内の絵文字解析
- ✅ エラーハンドリング

### MisskeyNote (`MisskeyNote.test.tsx`)

- ✅ 基本的なノート表示
- ✅ 絵文字プロキシ機能
- ✅ ユーザー情報の表示
- ✅ ファイル添付の処理
- ✅ エラーハンドリング

### 外部API (`useForeignApi.test.ts`)

- ✅ API呼び出しの成功/失敗
- ✅ 異なるレスポンス形式の処理
- ✅ ネットワークエラーの処理
- ✅ フック再レンダリング

### キャッシュデータベース (`emoji-cache-database.test.ts`)

- ✅ Jotai atom の動作
- ✅ Dexie データベースの操作
- ✅ キャッシュの更新と永続化
- ✅ エラーハンドリング

## テストの特徴

- **モック**: 外部依存関係を適切にモック化
- **エラーハンドリング**: 各種エラーケースをテスト
- **型安全性**: TypeScriptによる型チェック
- **カバレッジ**: 主要な機能パスをカバー
- **実用性**: 実際の使用ケースを想定したテスト
