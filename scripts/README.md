# Scripts

## fix-test-any.js

テストファイルの `noExplicitAny` lint エラーに自動で `// biome-ignore lint/suspicious/noExplicitAny: テストなので無視` コメントを追加するスクリプトです。

### 使用方法

```bash
pnpm run fix-test-any
```

### 動作

1. `biome check` を実行して lint エラーを取得
2. `noExplicitAny` エラーを抽出
3. テストファイル（`.test.ts`、`.test.tsx`、`.spec.ts`、`.spec.tsx`）のみを対象に処理
4. 各エラーの直前行に biome-ignore コメントを追加

### 対象ファイル

- `*.test.ts`
- `*.test.tsx`
- `*.spec.ts` 
- `*.spec.tsx`

非テストファイルは無視されます。

### 注意事項

- 既に biome-ignore コメントが存在する場合はスキップされます
- ファイルは自動で保存されます
- 後ろの行から順に処理するため、行番号がずれることはありません