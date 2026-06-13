# CLAUDE.md

このリポジトリのガイドラインは AGENTS.md に集約しています(各種 AI ツールと共通)。

@AGENTS.md

## Claude Code 向け補足

- パッケージマネージャは pnpm 必須。npm / yarn は使わない(engines で強制)。
- 編集後のフォーマットは PostToolUse フックが `pnpm dlx oxfmt` を自動実行するため、手動での `pnpm format` は基本不要。
- コミット前に lefthook が oxfmt / oxlint を実行する。フックで差分が出た場合はそのままステージされる。
- `apps/front/src/routeTree.gen.ts` は自動生成ファイルなので直接編集しない(`pnpm -F @mi-deck/front generate-routes` で再生成)。
- `.env` は permissions deny で読み書き禁止。環境変数の参照例は `.env.example` を見る。
