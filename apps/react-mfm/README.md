# @mi-deck/react-mfm

Misskey Flavored Markdown (MFM) を React で描画するためのコンポーネント群です。`mfm-js` をベースに、コードブロックや数式のハイライト、カスタム絵文字の描画、MFM 関数のアニメーションなど Misskey で一般的な表現をそのまま再現できます。

## 特徴

- MFM の通常構文と `$[...]` 関数構文を `mfm-js` で解釈して React コンポーネントに変換
- Shiki と KaTeX を動的読み込みし、コードブロックと数式を即時にレンダリング
- `CustomEmoji` / `Link` / `Mention` / `Hashtag` を Jotai ベースの設定で差し替え可能
- `@mi-deck/react-mfm/style.css` で提供するスタイルと CSS カスタムプロパティを用いたテーマ調整
- React 19 以降のクライアントコンポーネントとしてそのまま利用可能な ESM パッケージ

## インストール

```bash
pnpm add @mi-deck/react-mfm
```

必要に応じて KaTeX のスタイルシートも一度だけ読み込んでください。

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

Jotai `Provider` を利用しない場合でもデフォルトストアで動作しますが、アプリ全体で設定を共有する場合は `Provider` でラップしてください。

## コンポーネント

### `<Mfm />`

| プロパティ | 型                       | 既定値      | 説明                                                |
| ---------- | ------------------------ | ----------- | --------------------------------------------------- |
| `text`     | `string`                 | 必須        | 解析対象となる MFM 文字列                           |
| `plain`    | `boolean`                | `false`     | `true` の場合は解析せずテキストをそのまま描画       |
| `host`     | `string`                 | `undefined` | カスタム絵文字取得時のホスト情報 (カスタム実装向け) |
| `emojis`   | `Record<string, string>` | `undefined` | 絵文字名と画像 URL のマップ                         |

> `nowrap` / `nyaize` プロパティは将来の機能追加に向けたプレースホルダーです。現時点では限定的な動作のみ提供されます。

### `<MfmSimple />`

`Mfm` と同じ API で `parseSimple` を使用する軽量版です。Misskey クライアントの「シンプル表示」と同じ挙動を再現したい場合に利用してください。

## Provider 設定

`@mi-deck/react-mfm` は内部で Jotai を用いて構成を共有します。`Provider` をルートに置くことで、ツリー全体で同じ設定を参照できます。

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

- `Provider` を省略した場合は内部でデフォルトストアが生成され、単一コンポーネントでの利用には十分です。
- カスタムストアを使うと、`mfmConfigAtom` に初期値を設定したり、他の Jotai アトムと組み合わせて状態を同期できます。

## 設定 (MfmConfig)

`useMfmConfig` / `useMfmConfigValue` で描画設定とカスタムコンポーネントをアプリから注入できます。

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

設定で利用できる主なキーは次の通りです。

| キー          | 型                     | 既定値   | 用途                                                 |
| ------------- | ---------------------- | -------- | ---------------------------------------------------- |
| `advanced`    | `boolean`              | `true`   | `$[position]` など高度な MFM 関数を有効化            |
| `animation`   | `boolean`              | `true`   | スピンやレインボーなどアニメーション効果の有効／無効 |
| `CustomEmoji` | `FC<CustomEmojiProps>` | 内蔵実装 | カスタム絵文字描画の差し替え                         |
| `Hashtag`     | `FC<HashtagProps>`     | 内蔵実装 | ハッシュタグリンクの差し替え                         |
| `Link`        | `FC<LinkProps>`        | 内蔵実装 | URL / `$[link]` の描画差し替え                       |
| `Mention`     | `FC<MentionProps>`     | 内蔵実装 | メンションリンクの差し替え                           |

カスタム絵文字実装では `CustomEmojiCtx` を利用することで `host` や `emojis` の情報を参照できます。

## スタイルとテーマ

`@mi-deck/react-mfm/style.css` は MFM 向けの最低限のスタイルとアニメーションを提供します。アプリ固有のデザインに合わせたい場合は CSS カスタムプロパティを上書きしてください。

```css
:root {
  --mfm-link: var(--color-primary);
  --mfm-codeBg: #1b1b1d;
  --mfm-codeFg: #f3f4f6;
  --mfm-border: color-mix(in srgb, var(--color-primary) 30%, black);
}
```

Shiki と KaTeX が動的に HTML を生成するため、適切な CSS リセットやダークモード対応を行いたい場合はラッパー要素ごとにクラスを付与して制御すると安全です。

## 開発・テスト

ワークスペース直下で次のコマンドを利用できます。

- `pnpm -F @mi-deck/react-mfm build` — ライブラリのビルド (tsup)
- `pnpm -F @mi-deck/react-mfm test` — Vitest による単体テスト
- `pnpm -F @mi-deck/react-mfm dev` — tsup のウォッチモード

## 制限事項

- すべてのコンポーネントはクライアントサイド専用 (`"use client"`) です。SSR 環境では `next/dynamic` 等でクライアントレンダリングに切り替えてください。
- `nyaize` 機能はまだ実装途上です。

フィードバックや改善案があれば Issue / PR でお知らせください。
