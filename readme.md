

wsl でアクセスできるようにする方法
linux側
```/etc/hosts
127.0.0.1 local-misskey.local
```
windows側
```C:\Windows\System32\drivers\etc\hosts
127.0.0.1  local-misskey.local
```
どっちも編集したらmisskeyをブラウザとかからアクセスできるようになる




```bash 
# dump misskey sql 
docker exec mi-deck-misskey-db-1 pg_dumpall -c -U example-misskey-user  > db_dump/dump.sql 
docker compose exec misskey-db pg_dumpall -c -U example-misskey-user  > db_dump/dump.sql

#  restore misskey db

docker volume rm  mi-deck_misskey-db-1
docker-compose up -d misskey-db
cat db_dump/dump.sql | docker-compose exec --no-TTY misskey-db psql misskey example-misskey-user
```

# misskey local info
```
url: http://localhost:3002
user: @hoge
pass: hoge
```

# Clineテストプロンプト例

あなたの役割は、フロントエンドのエキスパートとしてテストコードを追加することです。カバレッジ 100%を目指します。

最初に `pnpm --filter front test:coverage` を実行して、テストが通っていることと、現在のテストカバレッジを確認します。

カバレッジが低いものから優先に、テストコードをユーザーに提案します。

テストは必ず一件ずつ追加して、`pnpm --filter front test -- <target>` でテストが通過することを確認します。

### apps/front/src/Components/**/*.tsx

React Component として次のコードを参考にテストを追加します。`@testing-library/react` を使用してコンポーネントをレンダリングし、アサーションを行います。

```ts
// 例: apps/front/src/Components/ui/button.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button"; // テスト対象の Button コンポーネントをインポート

describe("Button Component", () => {
  it("renders button with children", () => {
    render(<Button>Click Me</Button>);
    // ボタンが存在し、指定したテキストが表示されているか確認
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  // 必要に応じて、variant や size などの props に対するテストケースを追加
  it("applies the correct variant class", () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole("button", { name: /delete/i });
    // 特定の variant に対応するクラスが付与されているかなどを確認 (具体的なクラス名は実装による)
    // expect(buttonElement).toHaveClass("destructive-class-name"); // 仮のクラス名
  });
});
```

### apps/front/src/routes/**/*.tsx

`@tanstack/react-router` を使用したルートコンポーネントのテストを追加します。`createMemoryHistory` と `createRouter` を使用して、テスト環境でルーティングをシミュレートします。

```tsx
// 例: apps/front/src/routes/index.test.tsx
import { test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen"; // 生成された routeTree をインポート (パスは実際の構成に合わせる)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // React Query を使用している場合

test("Index route renders correctly", async () => {
  // React Query のクライアント (必要に応じて)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // テストではリトライしない方が安定することが多い
      },
    },
  });

  // 特定のルートに対するメモリヒストリを作成
  const memoryHistory = createMemoryHistory({
    initialEntries: ['/'], // テストしたいルートのパス
  });

  // ルーターインスタンスを作成
  // loader や context など、テストに必要な依存関係をモックまたは提供する
  const router = createRouter({
    routeTree,
    history: memoryHistory,
    // context: { queryClient, auth: mockAuthContext } // 必要に応じて context を提供
  });

  // RouterProvider と QueryClientProvider (必要に応じて) でラップしてレンダリング
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  // コンポーネントがレンダリングされ、期待される要素が表示されるのを待機
  // 例: 特定の見出しが表示されることを期待する場合
  await waitFor(() => {
    // getByRole など、よりセマンティックなクエリを使用することを推奨
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    // または特定のテキスト
    // expect(screen.getByText(/some specific text/i)).toBeInTheDocument();
  });

  // 必要に応じて、非同期処理（loaderなど）の結果が反映されているか確認
});
```
**注記:**
*   上記の例では、`routeTree.gen.ts` が `@tanstack/react-router` の CLI によって生成されていることを前提としています。実際のファイルパスに合わせて `import` を修正してください。
*   ルートコンポーネントが `loader` や `useContext` などで外部データや状態に依存している場合、テスト内でそれらを適切にモックするか、テスト用のデータを提供する必要があります (`QueryClientProvider` や `router` の `context` オプションなど)。
*   `expect` 内のアサーション (`/welcome/i` や `/some specific text/i`) は、テスト対象のルートコンポーネントが実際に表示する内容に合わせてください。

### apps/front/src/hooks/**/*.ts

React Hooks 関数に対してテストを追加します。`@testing-library/react` の `renderHook` を使用します。

```ts
// 例: apps/front/src/hooks/useCounter.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useCounter } from "./useCounter"; // テスト対象の useCounter フックをインポート

describe("useCounter Hook", () => {
  test("initial count is 0", () => {
    const { result } = renderHook(() => useCounter()); // フックをレンダリング
    expect(result.current.count).toBe(0); // 初期値を確認
  });

  test("increment increases count by 1", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment(); // increment 関数を実行
    });

    expect(result.current.count).toBe(1); // 値がインクリメントされたことを確認
  });

  test("decrement decreases count by 1", () => {
    // 初期値を設定してレンダリングする場合 (フックが引数を取る場合)
    // const { result } = renderHook(() => useCounter(5));
    const { result } = renderHook(() => useCounter());

    // まずインクリメントして値を変更
    act(() => {
      result.current.increment();
      result.current.increment();
    });
    expect(result.current.count).toBe(2);

    // デクリメントを実行
    act(() => {
      result.current.decrement(); // decrement 関数を実行 (存在する場合)
    });

    expect(result.current.count).toBe(1); // 値がデクリメントされたことを確認
  });

  // 必要に応じて、非同期処理や副作用を伴うフックのテストケースを追加
});
```

### Network Mocking

`msw/node` でネットワークリクエストをモックします。API クライアントや `fetch` を使用する箇所をテストする際に利用します。

```ts
import { afterAll, afterEach, beforeAll, expect, test, describe } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
// import { fetchUserProfile } from "./apiClient"; // API リクエストを行う関数をインポート

// モックする API リクエストのハンドラを定義
const handlers = [
  http.get('/api/user/:userId', ({ params }) => { // パスパラメータを含む例
    const { userId } = params;
    if (userId === '1') {
      return HttpResponse.json({ id: '1', name: 'Alice', email: 'alice@example.com' });
    }
    return new HttpResponse(null, { status: 404 }); // 存在しないユーザーの場合は 404
  }),
  http.post('/api/posts', async ({ request }) => { // POST リクエストの例
    const newPost = await request.json();
    return HttpResponse.json({ id: 'post-123', ...newPost }, { status: 201 });
  }),
];

// モックサーバーのセットアップ
const server = setupServer(...handlers);

// テストスイート全体の前後でサーバーを起動・停止
beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // 未処理リクエストはエラーにする
// 各テストの後にハンドラをリセット (テスト間の影響を防ぐ)
afterEach(() => server.resetHandlers());
// テストスイート全体の終了時にサーバーを閉じる
afterAll(() => server.close());

describe('API Client Tests', () => {
  test('fetchUserProfile successfully retrieves user data', async () => {
    // const user = await fetchUserProfile('1'); // API を呼び出す関数を実行
    // expect(user).toEqual({ id: '1', name: 'Alice', email: 'alice@example.com' });
    // 上記は fetchUserProfile 関数の実装に依存するためコメントアウト
    // 実際の API 呼び出しコードに合わせて検証してください
    const response = await fetch('/api/user/1'); // 直接 fetch を使う場合の例
    const user = await response.json();
    expect(response.status).toBe(200);
    expect(user).toEqual({ id: '1', name: 'Alice', email: 'alice@example.com' });
  });

  test('fetchUserProfile handles not found error', async () => {
    // await expect(fetchUserProfile('2')).rejects.toThrow('User not found'); // エラーハンドリングのテスト例
    const response = await fetch('/api/user/2'); // 直接 fetch を使う場合の例
    expect(response.status).toBe(404);
  });

  test('createPost successfully creates a new post', async () => {
    const postData = { title: 'New Post', body: 'This is the content.' };
    // const createdPost = await createPost(postData); // API を呼び出す関数を実行
    // expect(createdPost).toMatchObject({ ...postData, id: expect.any(String) });
    const response = await fetch('/api/posts', { // 直接 fetch を使う場合の例
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const createdPost = await response.json();
    expect(response.status).toBe(201);
    expect(createdPost).toMatchObject({ ...postData, id: 'post-123' });
  });
});
```

### others

React やルーティング、ネットワークに関係ない純粋な TypeScript/JavaScript のロジックは、Vitest の標準的な機能 (`describe`, `it`, `expect` など) を使用してテストします。

```ts
// 例: apps/front/src/utils/formatDate.test.ts
import { describe, it, expect } from "vitest";
import { formatDate } from "./formatDate"; // テスト対象の関数をインポート

describe("formatDate Utility", () => {
  it("formats a date object correctly", () => {
    const date = new Date(2024, 4, 5); // 2024年5月5日 (月は0から始まる)
    expect(formatDate(date)).toBe("2024/05/05"); // 期待されるフォーマット
  });

  it("handles invalid date input", () => {
    // 不正な日付や null/undefined に対する挙動をテスト
    expect(formatDate(null)).toBe("Invalid Date"); // またはエラーをスローするなど、関数の仕様による
    expect(formatDate(undefined)).toBe("Invalid Date");
    expect(formatDate(new Date("invalid date string"))).toBe("Invalid Date");
  });

  // 必要に応じて、異なるフォーマットやロケールに対応するテストケースを追加
});
```
