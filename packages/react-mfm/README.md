# mfm-react-render

A set of React components for rendering Misskey Flavored Markdown (MFM). Based on `mfm-js`, it faithfully reproduces common Misskey expressions such as code block and math syntax highlighting, custom emoji rendering, and MFM function animations.

## Features

- Parses standard MFM syntax and `$[...]` function syntax using `mfm-js` and converts them into React components.
- Dynamically loads Shiki and KaTeX for instant rendering of code blocks and math formulas.
- Replaceable `CustomEmoji` / `Link` / `Mention` / `Hashtag` components using Jotai-based configuration.
- Theme customization using CSS custom properties and styles provided by `mfm-react-render/style.css`.
- An ESM package ready to be used as React 19+ Client Components.

## Installation

```bash
pnpm add mfm-react-render
```

If necessary, load the KaTeX stylesheet once.

```ts
import "katex/dist/katex.min.css";
```

## Quick Start

```tsx
import { Provider } from "jotai";
import { Mfm } from "mfm-react-render";
import "mfm-react-render/style.css";

export function App() {
  return (
    <Provider>
      <Mfm
        text="$[tada **Hello**] 🎉"
        emojis={{ party: "https://example.com/party.webp" }}
      />
    </Provider>
  );
}
```

Even if you don't use the Jotai `Provider`, it will work with the default store, but please wrap it with `Provider` if you want to share settings across the entire app.

## Components

### `<Mfm />`

| Property | Type                     | Default     | Description                                                               |
| :------- | :----------------------- | :---------- | :------------------------------------------------------------------------ |
| `text`   | `string`                 | Required    | The MFM string to be parsed.                                              |
| `plain`  | `boolean`                | `false`     | If `true`, renders the text as-is without parsing.                        |
| `host`   | `string`                 | `undefined` | Host information for fetching custom emojis (for custom implementations). |
| `emojis` | `Record<string, string>` | `undefined` | A map of emoji names to image URLs.                                       |

> The `nowrap` / `nyaize` properties are placeholders for future feature additions. Only limited functionality is provided at this time.

### `<MfmSimple />`

A lightweight version that uses `parseSimple` with the same API as `Mfm`. Use this when you want to reproduce the same behavior as the "Simple View" in Misskey clients.

## Provider Configuration

`mfm-react-render` uses Jotai internally to share configuration. By placing a `Provider` at the root, you can reference the same settings throughout the tree.

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider, createStore } from "jotai";
import {
  Mfm,
  mfmConfigAtom,
} from "mfm-react-render";

const store = createStore();
store.set(mfmConfigAtom, {
  animation: false,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Mfm text="$[tada **Configured**]" />
    </Provider>
  </StrictMode>,
);
```

- If `Provider` is omitted, a default store is generated internally, which is sufficient for use in a single component.
- Using a custom store allows you to set initial values for `mfmConfigAtom` or synchronize state with other Jotai atoms.

## Configuration (MfmConfig)

You can inject rendering settings and custom components from your app using `useMfmConfig` / `useMfmConfigValue`.

```tsx
import { useEffect } from "react";
import { useMfmConfig, Mfm } from "mfm-react-render";

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

The main keys available for configuration are as follows:

| Key           | Type                   | Default  | Usage                                                     |
| :------------ | :--------------------- | :------- | :-------------------------------------------------------- |
| `advanced`    | `boolean`              | `true`   | Enables advanced MFM functions like `$[position]`.        |
| `animation`   | `boolean`              | `true`   | Enables/disables animation effects like spin and rainbow. |
| `CustomEmoji` | `FC<CustomEmojiProps>` | Built-in | Replaces custom emoji rendering.                          |
| `Hashtag`     | `FC<HashtagProps>`     | Built-in | Replaces hashtag link rendering.                          |
| `Link`        | `FC<LinkProps>`        | Built-in | Replaces URL / `$[link]` rendering.                       |
| `Mention`     | `FC<MentionProps>`     | Built-in | Replaces mention link rendering.                          |

In custom emoji implementations, you can use `CustomEmojiCtx` to access `host` and `emojis` information.

## Styles and Themes

`mfm-react-render/style.css` provides minimal styles and animations for MFM. If you want to match your app's specific design, override the CSS custom properties.

```css
:root {
  --mfm-link: var(--color-primary);
  --mfm-codeBg: #1b1b1d;
  --mfm-codeFg: #f3f4f6;
  --mfm-border: color-mix(in srgb, var(--color-primary) 30%, black);
}
```

Since Shiki and KaTeX generate HTML dynamically, it is safer to apply classes to each wrapper element to control appropriate CSS resets and dark mode support.

## Development & Testing

The following commands are available at the workspace root:

- `pnpm -F mfm-react-render build` — Build the library (tsup)
- `pnpm -F mfm-react-render test` — Unit tests with Vitest
- `pnpm -F mfm-react-render dev` — Watch mode with tsup

## Limitations

- All components are client-side only (`"use client"`). In SSR environments, please switch to client rendering using `next/dynamic` or similar.
- The `nyaize` feature is still under implementation.

If you have feedback or improvement suggestions, please let us know via Issue / PR.
