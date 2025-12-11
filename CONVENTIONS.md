# 開発規約

このプロジェクトでは、モノレポ構成で pnpm をパッケージマネージャーとして使用します。
常に pnpm コマンド（例: `pnpm install`, `pnpm test`）を使用してください。npm や yarn は使用しないでください。

ルートの `package.json` には、特定のワークスペースを対象とするショートカットスクリプトが定義されています。

**サーバーサイド**アプリケーション（`@mi-deck/server`、`apps/server` に配置）に固有のコマンドを実行する場合:
ルートスクリプト `pnpm run server -- <command>` を使用します。
例: サーバーのテストを実行するには、`pnpm run server -- test` を使用します。
例: サーバーをビルドするには、`pnpm run server -- build` を使用します。
例: サーバーの e2e テストを実行するには、`pnpm run test:e2e:server` を使用します。

**フロントエンド**アプリケーション（`@mi-deck/front`、`apps/front` に配置）に固有のコマンドを実行する場合:
ルートスクリプト `pnpm run front -- <command>` を使用します。
例: フロントエンドの開発サーバーを起動するには、`pnpm run front -- dev` を使用します。
例: フロントエンドの lint を実行するには、`pnpm run front -- lint` を使用します。

`pnpm run server` または `pnpm run front` の後に `--` を使用して、後続の引数をスクリプト内の基盤となる pnpm コマンドに正しく渡すことに注意してください。

ログインページが表示された場合、ログインメールアドレスは `example2@example.com`、パスワードは `password` です。

Misskey のタイムライン情報などを取得するには、Misskey-js ライブラリを使用してください。
フロントエンドから直接 Misskey-js に接続します。

# gitのメッセージの規約

gitのコミットは日本語でしてください
