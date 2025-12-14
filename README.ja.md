# Mi-Deck

![License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)

> [!WARNING]
> **プロジェクトステータス: 実験的**
> このプロジェクトは現在、開発の初期段階（v0.0.0）です。機能やAPIは変更される可能性があります。

**Mi-Deck** は、[Misskey](https://misskey-hub.net/) 向けのモダンで機能豊富なウェブクライアントです。最新のフロントエンド技術で構築されており、高速でアクセスしやすいユーザーエクスペリエンスを提供します。

## ✨ 主な機能

- **モダンなアーキテクチャ**: React 19、Vite 7、TypeScript で構築されており、高いパフォーマンスと型安全性を実現しています。
- **高度なルーティングとデータ**: **TanStack Router** と **TanStack Query** を活用し、シームレスなナビゲーションと効率的なサーバー状態管理を実現しています。
- **状態管理**: 柔軟でアトミックなクライアント状態管理のために **Jotai** を使用しています。
- **美しいUI**: **Tailwind CSS v4** と **Radix UI** のプリミティブを使用して、アクセスしやすく高品質なコンポーネントでスタイルされています。
- **MFMサポート**: カスタムの `@mi-deck/react-mfm` パッケージを介して、**Misskey Flavored Markdown (MFM)** を完全にサポートしています。
- **堅牢なテスト**: **Vitest**、**Playwright**、\***\*Testing Library** を使用した包括的なテスト戦略。
- **開発者体験**: **Storybook** によるコンポーネント分離、**Oxlint** および **Biome** による高速なツール。

## 🛠️ 技術スタック

- **フレームワーク**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **ルーティング**: [TanStack Router](https://tanstack.com/router)
- **データフェッチ**: [TanStack Query](https://tanstack.com/query)
- **状態管理**: [Jotai](https://jotai.org/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **フォーム**: [React Hook Form](https://react-hook-form.com/) + [Valibot](https://valibot.dev/)
- **テスト**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), [MSW](https://mswjs.io/)
- **モノレポ**: [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)

## 📂 プロジェクト構造

このプロジェクトはモノレポとして構成されています：

- **`apps/front`**: メインのウェブアプリケーションクライアント。
- **`packages/react-mfm`**: Misskey Flavored Markdown をレンダリングするための再利用可能なライブラリ。

## 🚀 はじめに

### 前提条件

以下のものがインストールされていることを確認してください：

- **Node.js**: >= 25
- **pnpm**: >= 10
- **Docker**: (オプション) ローカルのMisskeyインスタンスを実行するために必要です。

### インストール

リポジトリをクローンし、依存関係をインストールします：

```bash
git clone https://github.com/mochi-sann/mi-deck.git
cd mi-deck
pnpm install
```

### 設定

環境設定ファイルをコピーして設定します：

```bash
cp .env.example .env
```

`.env` を編集して、環境変数（例：`DATABASE_URL`、`JWT_SECRET`）を設定してください。

### ローカルバックエンドの実行

開発用にMisskeyのローカルインスタンス（PostgreSQLとRedisを含む）を起動するには：

```bash
docker compose up -d
```

これにより、`http://localhost:3002` でMisskeyサーバーが起動します。

### 開発

フロントエンドおよびその他のパッケージの開発サーバーを起動するには：

```bash
pnpm dev
```

これにより、通常 `http://localhost:5173` でアプリが起動します。

### ビルド

本番用にアプリケーションとパッケージをビルドするには：

```bash
pnpm build
```

### デプロイ

このプロジェクトは、`wrangler` を介して **Cloudflare Pages** へのデプロイ用に設定されています。

## 🧪 テストと品質

私たちは、テストとリンティングを通じて高いコード品質基準を維持しています。

- **すべてのテストを実行**:
  ```bash
  pnpm test
  ```
- **Lint と型チェック**:
  ```bash
  pnpm check
  ```
- **コードのフォーマット**:
  ```bash
  pnpm format
  ```

## 🤝 貢献

貢献は大歓迎です！既存のコードスタイルと規約に従ってください。

## 📄 ライセンス

このプロジェクトは [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) の下でライセンスされています。
