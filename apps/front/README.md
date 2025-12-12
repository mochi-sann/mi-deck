# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

````markdown
あなたの役割は、フロントエンドのエキスパートとしてテストコードを追加することです。カバレッジ 100%を目指します。

最初に `npx vitest --run --coverage --reporter=dot` を実行して、テストが通っていることと、現在のテストカバレッジを確認します

カバレッジが低いものから優先に、テストコードをユーザーに提案します。

テストは必ず一件ずつ追加して、`npx vitest --run <target>` でテストが通過することを確認します。

### app/components/\*.tsx

React Component として次のコードを参考にテストを追加します。

```ts
// app/components/counter.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Counter from "./Counter";

it("autogen: Counter", () => {
  render(<Counter />);
});
```

### app/routes/\*.tsx

react-router に対して Stub のテストパターンを追加します。

```tsx
// app/routes/home.test.tsx
import { test, expect } from "vitest";
import { createRoutesStub } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "./home";

test("autogen: Home route", async () => {
  const Stub = createRoutesStub([{ path: "/", Component: Home }]);
  render(<Stub />);
  await waitFor(() => {
    screen.findByText("Display Result");
  });
});
```

### app/use-\*.tsx

React Hooks 関数に対してテストを追加します。

```tsx
// useCounter.test.tsx
import { renderHook, act, waitFor, render } from "@testing-library/react";
import { use, useEffect, useState, useActionState } from "react";
import { describe, expect, test } from "vitest";

test("autogen: useCounter", () => {
  const { result } = renderHook(useCounter);
  expect(result.current.count).toBe(0);
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

### Network Mocking

msw/node でネットワークを mock します。

```ts
import { afterAll, beforeAll, expect, test } from "vitest";
import { getUser } from "./request";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const mockServer = setupServer(
  http.get("/api/user", () => {
    return HttpResponse.json({
      id: "123",
      name: "John Doe",
    });
  })
);

beforeAll(() => {
  mockServer.listen();
});

afterAll(() => {
  mockServer.restoreHandlers();
});

test("getUser", async () => {
  const res = await getUser();
  expect(res).toEqual({
    id: "123",
    name: "John Doe",
  });
});
```

### others

React に関係ないものは、純粋な TypeScript のロジックとしてテストします。
````

---
