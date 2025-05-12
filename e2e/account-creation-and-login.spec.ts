import { test, expect } from "@playwright/test";

test.describe("アカウント作成とログイン", () => {
  const uniqueEmail = `testuser-${Date.now()}@example.com`;
  const password = "password123";
  const username = `testuser-${Date.now()}`;

  test("新しいアカウントを作成し、そのアカウントでログインできること", async ({
    page,
  }) => {
    // アカウント作成ページに移動 (実際のパスに置き換えてください)
    await page.goto("/login/sign-up"); // CONVENTIONS.md には /login としか書かれていないため、サインアップページの具体的なパスを想定

    // アカウント作成フォームの入力
    // メールアドレス入力フィールドのセレクタ (実際のセレクタに置き換えてください)
    await page.locator('input[name="email"]').fill(uniqueEmail);
    // パスワード入力フィールドのセレクタ (実際のセレクタに置き換えてください)
    await page.locator('input[name="password"]').fill(password);
    // ユーザー名入力フィールドのセレクタ (実際のセレクタに置き換えてください)
    await page.locator('input[name="username"]').fill(username);

    // アカウント作成ボタンをクリック (実際のセレクタに置き換えてください)
    // CONVENTIONS.md には git のコミットメッセージは日本語とあるので、ボタンテキストも日本語の可能性を考慮
    await page.getByRole("button", { name: /登録|作成|Sign Up/i }).click();

    // ログインページへのリダイレクトを確認 (実際のパスに置き換えてください)
    await expect(page).toHaveURL("/login", { timeout: 10000 }); // タイムアウトを長めに設定

    // ログインフォームの入力
    // メールアドレス入力フィールドのセレクタ (実際のセレクタに置き換えてください)
    await page.locator('input[name="email"]').fill(uniqueEmail);
    // パスワード入力フィールドのセレクタ (実際のセレクタに置き換えてください)
    await page.locator('input[name="password"]').fill(password);

    // ログインボタンをクリック (実際のセレクタに置き換えてください)
    await page.getByRole("button", { name: /ログイン|Login/i }).click();

    // ログイン後のページへのリダイレクトを確認 (例: ホームページやダッシュボードのパスに置き換えてください)
    // 一般的なホームページのパス "/" を想定
    await expect(page).toHaveURL("/", { timeout: 10000 }); // タイムアウトを長めに設定

    // ログイン後のページにユーザー名が表示されるなどの確認を追加できます
    // 例: await expect(page.getByText(`ようこそ、${username}さん`)).toBeVisible();
  });

  test("既存のアカウントでログインできること (CONVENTIONS.md の情報を使用)", async ({
    page,
  }) => {
    // ログインページに移動 (実際のパスに置き換えてください)
    await page.goto("/login");

    // ログインフォームの入力 (CONVENTIONS.md に記載のテストアカウント情報)
    const loginEmail = "example2@example.com";
    const loginPassword = "password";

    // メールアドレス入力フィールドのセレクタ (実際のセレクタに置き換えてください)
    await page.locator('input[name="email"]').fill(loginEmail);
    // パスワード入力フィールドのセレクタ (実際のセレクタに置き換えてください)
    await page.locator('input[name="password"]').fill(loginPassword);

    // ログインボタンをクリック (実際のセレクタに置き換えてください)
    await page.getByRole("button", { name: /ログイン|Login/i }).click();

    // ログイン後のページへのリダイレクトを確認 (例: ホームページやダッシュボードのパスに置き換えてください)
    await expect(page).toHaveURL("/", { timeout: 10000 }); // タイムアウトを長めに設定

    // ログイン後のページに特定の要素が表示されることを確認
    // 例: await expect(page.getByText("ダッシュボード")).toBeVisible();
  });
});
