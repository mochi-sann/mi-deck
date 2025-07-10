# @mi-deck/react-mfm

A React component library for rendering MFM (Markup For Misskey) text with TypeScript support.

This is a fork of [react-mfm](https://github.com/yamader/react-mfm) enhanced with additional features for mi-deck.

## Features

- 🚀 **ESM Support**: Built as ESM module with TypeScript definitions
- 🎨 **Rich MFM Rendering**: Support for all MFM syntax including animations, formatting, and functions
- 🔧 **Configurable Components**: Customize rendering with your own components
- 💾 **Emoji Caching**: Built-in IndexedDB caching for custom emojis
- 🧪 **Well Tested**: Comprehensive test suite with Vitest
- ⚡ **Performance**: Optimized with code splitting and tree shaking
- 🎯 **Type Safe**: Full TypeScript support with strict typing

## Installation

```bash
npm install @mi-deck/react-mfm
# or
pnpm add @mi-deck/react-mfm
# or
yarn add @mi-deck/react-mfm
```

## Usage

### Basic Usage

```tsx
import { Provider } from 'jotai';
import Mfm from '@mi-deck/react-mfm';
import '@mi-deck/react-mfm/style.css';
import 'katex/dist/katex.min.css'; // Required for math formulas

const text = `
<center>
  **Hello, world!** 🌍
  
  $[spin 回転するテキスト]
  
  \`\`\`javascript
  console.log('Code block support');
  \`\`\`
</center>
`.trim();

export default function App() {
  return (
    <Provider>
      <Mfm text={text} />
    </Provider>
  );
}
```

### With Custom Emojis

```tsx
import Mfm from '@mi-deck/react-mfm';

const emojis = {
  custom_emoji: 'https://example.com/emoji.png'
};

export default function Example() {
  return (
    <Provider>
      <Mfm 
        text="Hello :custom_emoji: world!" 
        emojis={emojis}
        host="example.com"
      />
    </Provider>
  );
}
```

### Plain Mode

```tsx
import Mfm from '@mi-deck/react-mfm';

// Renders as plain text without MFM parsing
export default function PlainExample() {
  return (
    <Provider>
      <Mfm text="**This won't be bold**" plain />
    </Provider>
  );
}
```

### Simple MFM

```tsx
import { MfmSimple } from '@mi-deck/react-mfm';

// Uses parseSimple for basic formatting only
export default function SimpleExample() {
  return (
    <Provider>
      <MfmSimple text="Simple MFM rendering" />
    </Provider>
  );
}
```

## Configuration

### Custom Components

You can customize how MFM elements are rendered:

```tsx
import { Provider } from 'jotai';
import Mfm, { mfmConfigAtom } from '@mi-deck/react-mfm';

const CustomHashtag = ({ hashtag }: { hashtag: string }) => (
  <a href={`/tags/${hashtag}`} className="custom-hashtag">
    #{hashtag}
  </a>
);

const store = createStore();
store.set(mfmConfigAtom, {
  Hashtag: CustomHashtag,
  advanced: true,
  animation: true
});

export default function CustomExample() {
  return (
    <Provider store={store}>
      <Mfm text="#customized hashtag rendering" />
    </Provider>
  );
}
```

### Available Configuration Options

```typescript
export type MfmConfig = Partial<{
  // MFM features
  advanced: boolean;     // Enable advanced features (default: true)
  animation: boolean;    // Enable animations (default: true)

  // Custom components
  CustomEmoji: FC<CustomEmojiProps>;
  Hashtag: FC<HashtagProps>;
  Link: FC<LinkProps>;
  Mention: FC<MentionProps>;
}>;
```

## API Reference

### Main Components

#### `Mfm`

The main MFM rendering component with full feature support.

```typescript
interface MfmProps {
  text: string;                                    // MFM text to render
  plain?: boolean;                                // Render as plain text
  nowrap?: boolean;                              // Disable line wrapping
  nyaize?: boolean | "respect";                  // Enable nyaize transformation
  host?: string;                                 // Host for emoji resolution
  emojis?: { [key: string]: string };           // Custom emoji mapping
}
```

#### `MfmSimple`

Simplified MFM rendering for basic formatting only.

```typescript
// Same props as Mfm but uses parseSimple internally
```

### Hooks

#### `useMfmConfig()` / `useMfmConfigValue()`

Access and modify MFM configuration:

```tsx
import { useMfmConfig, useMfmConfigValue } from '@mi-deck/react-mfm';

function MyComponent() {
  const [config, setConfig] = useMfmConfig();
  const configValue = useMfmConfigValue();
  
  // Update configuration
  setConfig({ animation: false });
}
```

## Development

### Scripts

```bash
# Development
pnpm dev          # Watch mode compilation
pnpm build        # Production build
pnpm check        # TypeScript type checking

# Testing
pnpm test         # Run tests
pnpm test:watch   # Watch mode testing
pnpm test:coverage # Test with coverage report
```

### Project Structure

```
src/
├── components/          # MFM element components
│   ├── Code.tsx        # Code block rendering
│   ├── CustomEmoji.tsx # Custom emoji handling
│   ├── Emoji.tsx       # Unicode emoji (Twemoji)
│   ├── Fn.tsx          # MFM functions ($[...])
│   ├── Formula.tsx     # Math formulas (KaTeX)
│   ├── Hashtag.tsx     # Hashtag links
│   ├── Link.tsx        # URL links
│   ├── Mention.tsx     # User mentions
│   ├── Search.tsx      # Search syntax
│   └── Sparkle.tsx     # Sparkle animation
├── database/           # Emoji caching
├── models/            # TypeScript types
├── test/             # Test setup
├── types/           # Type declarations
├── index.tsx       # Main exports
├── Node.tsx       # MFM node renderer
├── style.css     # Component styles
└── utils.ts     # Utility functions
```

## Dependencies

### Runtime Dependencies

- `@twemoji/api` - Twemoji emoji rendering
- `dexie` - IndexedDB wrapper for emoji caching
- `jotai` - State management
- `katex` - Math formula rendering
- `mfm-js` - MFM parsing library
- `shiki` - Syntax highlighting

### Peer Dependencies

- `react` >= 19.0.0

## Requirements

- React 19.0.0 or later
- Node.js 18+ for development
- Modern browser with ES2022 support

## License

This project maintains the same license as the original react-mfm.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `pnpm test` and `pnpm check`
5. Submit a pull request

## Notes

- This package is built as ESM only
- Requires Jotai Provider for state management
- Custom emoji caching uses IndexedDB
- Math formulas require KaTeX CSS to be imported
- Some animations may require CSS support for transforms

## Migration from react-mfm

This package includes several enhancements:

- ✅ ESM-first architecture
- ✅ Enhanced TypeScript support
- ✅ Built-in emoji caching
- ✅ Improved test coverage
- ✅ Better component configurability
- ✅ Modern build tooling (tsup)

Most APIs remain compatible with the original react-mfm.