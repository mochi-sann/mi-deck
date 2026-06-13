---
name: new-component
description: Use when creating a new React component in apps/front (feature component, UI part, or form component).
---

# 新規コンポーネント作成

apps/front の規約に沿って、コンポーネント本体 + テスト + Storybook ストーリーをセットで作る。

## 配置先の決定

| 種類                     | 配置先                                                          |
| ------------------------ | --------------------------------------------------------------- |
| 機能固有のコンポーネント | `apps/front/src/features/<feature>/components/`                 |
| 機能固有の hook          | `apps/front/src/features/<feature>/hooks/`                      |
| 汎用 UI パーツ           | `apps/front/src/components/parts/`                              |
| フォーム部品             | `apps/front/src/components/forms/`                              |
| shadcn/ui 系プリミティブ | `apps/front/src/components/ui/`(既存を再利用、新規追加は慎重に) |

## 手順

1. 配置先を決める(迷ったら features 配下。汎用化は 2 箇所目で使うときに行う)
2. このディレクトリの `templates/` を参考に 3 ファイルを作成する:
   - `ComponentName.tsx`(本体)
   - `ComponentName.test.tsx`(同階層に配置)
   - `ComponentName.stories.tsx`(ユーザーが操作する見た目のあるコンポーネントのみ)
3. `pnpm check` と `pnpm -F @mi-deck/front test -- <path>` で検証する

## 規約

- named export の function コンポーネント(default export しない)
- ファイル名・コンポーネント名は PascalCase
- スタイルは Tailwind。バリアントは `class-variance-authority`(cva)、クラス結合は `@/lib/utils` の `cn`
- プリミティブは Radix UI(`@/components/ui/` の既存ラッパーを優先)
- Props 型は `interface XxxProps` を export
- 文言は i18next を使う(`src/locales/{ja,en}/` の両方にキーを追加。片方だけ追加するとフックの validate-translations が失敗する)
- Storybook の title は `Features/<Feature>/<ComponentName>`、`satisfies Meta<typeof X>` を付ける
- テストは Vitest + React Testing Library。API 通信は MSW、IndexedDB(StorageProvider)はコンテキストをモック

テンプレート: [templates/Component.tsx.template](templates/Component.tsx.template) / [templates/Component.test.tsx.template](templates/Component.test.tsx.template) / [templates/Component.stories.tsx.template](templates/Component.stories.tsx.template)
