import { jwt } from "hono/jwt";

export const jwtAuth = jwt({
  secret: "your-secret-key", // 環境変数から読み取ることを推奨
  // トークンの検証エラー時のハンドリング
  onError: (err: any, c: any) => {
    return c.json({ message: "Unauthorized", error: err.message }, 401);
  },
});
