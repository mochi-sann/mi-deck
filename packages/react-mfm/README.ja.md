# @mi-deck/react-mfm

Misskey Flavored Markdown (MFM) を React でレンダリングするためのコンポーネント群です。`mfm-js` をベースに、コードブロックや数式のシンタックスハイライト、カスタム絵文字のレンダリング、MFM 関数のアニメーションなど、Misskey で一般的な表現を忠実に再現します。

## 機能

- `mfm-js` を使用して標準 MFM 構文と `$[...]` 関数構文をパースし、React コンポーネントに変換します。
- Shiki と KaTeX を動的にロードし、コードブロックと数式を即座にレンダリングします。
- Jotai ベースの設定を使用して、`CustomEmoji` / `Link` / `Mention` / `Hashtag` コンポーネントを差し替え可能です。
- `@mi-deck/react-mfm/style.css` で提供されるスタイルと CSS カスタムプロパティを使用してテーマをカスタマイズできます。
- React 19+ クライアントコンポーネントとしてそのまま使用できる ESM パッケージです。

## インストール

```bash
pnpm add @mi-deck/react-mfm
```

必要に応じて、KaTeX のスタイルシートを一度ロードしてください。

```ts
import "katex/dist/katex.min.css";
```

## クイックスタート

```tsx
import { Provider } from "jotai";
import { Mfm } from "@mi-deck/react-mfm";
import "@mi-deck/react-mfm/style.css";

export function App() {
  return (
    <Provider>
      <Mfm
        text="$[tada **こんにちは**] 🎉"
        emojis={{ party: "https://example.com/party.webp" }}
      />
    </Provider>
  );
}
```

Jotai `Provider` を使用しない場合でもデフォルトのストアで動作しますが、アプリ全体で設定を共有したい場合は `Provider` でラップしてください。

## コンポーネント

### `<Mfm />`

| プロパティ | 型                       | 既定値      | 説明                                                              |
| :--------- | :----------------------- | :---------- | :---------------------------------------------------------------- |
| `text`     | `string`                 | 必須        | パース対象となる MFM 文字列                                       |
| `plain`    | `boolean`                | `false`     | `true` の場合、パースせずにテキストをそのままレンダリングします。 |
| `host`     | `string`                 | `undefined` | カスタム絵文字取得のためのホスト情報（カスタム実装用）。          |
| `emojis`   | `Record<string, string>` | `undefined` | 絵文字名と画像 URL のマップ。                                     |

> `nowrap` / `nyaize` プロパティは将来の機能追加のためのプレースホルダーです。現時点では限定的な機能しか提供されていません。

### `<MfmSimple />`

`Mfm` と同じ API で `parseSimple` を使用する軽量版です。Misskey クライアントの「シンプル表示」と同じ動作を再現したい場合に使用してください。

## Provider 設定

`@mi-deck/react-mfm` は内部で Jotai を使用して設定を共有します。ルートに `Provider` を配置することで、ツリー全体で同じ設定を参照できます。

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider, createStore } from "jotai";
import {
  Mfm,
  mfmConfigAtom,
} from "@mi-deck/react-mfm";

const store = createStore();
store.set(mfmConfigAtom, {
  animation: false,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Mfm text="$[tada **設定済み**]" />
    </Provider>
  </StrictMode>,
);
```

- `Provider` を省略した場合、内部でデフォルトのストアが生成され、単一コンポーネントでの使用には十分です。
- カスタムストアを使用すると、`mfmConfigAtom` の初期値を設定したり、他の Jotai アトムと状態を同期したりできます。

## 設定 (MfmConfig)

`useMfmConfig` / `useMfmConfigValue` を使用して、アプリケーションからレンダリング設定とカスタムコンポーネントを注入できます。

```tsx
import { useEffect } from "react";
import { useMfmConfig, Mfm } from "@mi-deck/react-mfm";

const ExternalLink = (props: React.ComponentProps<"a">) => (
  <a {...props} className="underline decoration-dotted" target="_blank" />
);

export function TimelineItem({ body }: { body: string }) {
  const [, setConfig] = useMfmConfig();

  useEffect(() => {
    setConfig((config) => ({
      ...config,
      animation: false,
      Link: ExternalLink,
    }));
  }, [setConfig]);

  return <Mfm text={body} />;
}
```

設定で利用できる主なキーは以下の通りです。

| キー          | 型                     | 既定値   | 用途                                                            |
| :------------ | :--------------------- | :------- | :-------------------------------------------------------------- |
| `advanced`    | `boolean`              | `true`   | `$[position]` のような高度な MFM 関数を有効にします。           |
| `animation`   | `boolean`              | `true`   | スピンやレインボーなどのアニメーション効果を有効/無効にします。 |
| `CustomEmoji` | `FC<CustomEmojiProps>` | 内蔵実装 | カスタム絵文字のレンダリングを置き換えます。                    |
| `Hashtag`     | `FC<HashtagProps>`     | 内蔵実装 | ハッシュタグリンクのレンダリングを置き換えます。                |
| `Link`        | `FC<LinkProps>`        | 内蔵実装 | URL / `$[link]` のレンダリングを置き換えます。                  |
| `Mention`     | `FC<MentionProps>`     | 内蔵実装 | メンションリンクのレンダリングを置き換えます。                  |

カスタム絵文字の実装では、`CustomEmojiCtx` を使用して `host` および `emojis` の情報にアクセスできます。

## スタイルとテーマ

`@mi-deck/react-mfm/style.css` は、MFM 向けの最小限のスタイルとアニメーションを提供します。アプリケーション固有のデザインに合わせたい場合は、CSS カスタムプロパティを上書きしてください。

```css
:root {
  --mfm-link: var(--color-primary);
  --mfm-codeBg: #1b1b1d;
  --mfm-codeFg: #f3f4f6;
  --mfm-border: color-mix(in srgb, var(--color-primary) 30%, black);
}
```

Shiki と KaTeX は動的に HTML を生成するため、適切な CSS リセットやダークモードのサポートを制御するには、各ラッパー要素にクラスを適用するのが安全です。

## 開発とテスト

ワークスペースルートで以下のコマンドが利用可能です。

- `pnpm -F @mi-deck/react-mfm build` — ライブラリのビルド (tsup)
- `pnpm -F @mi-deck/react-mfm test` — Vitest による単体テスト
- `pnpm -F @mi-deck/react-mfm dev` — tsup のウォッチモード

## 制限事項

- すべてのコンポーネントはクライアントサイド専用 (`"use client"`) です。SSR 環境では、`next/dynamic` などを使用してクライアントレンダリングに切り替えてください。
- `nyaize` 機能はまだ実装途中です。

フィードバックや改善提案があれば、Issue / PR でお知らせください。
