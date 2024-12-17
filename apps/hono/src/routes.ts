import { Hono } from "hono";
import type { Variables } from "hono/types";
import { AuthRoute } from "./routes/auth.js";

// 各ルートモジュールをインポート

const routesApp = new Hono<{ Variables: Variables }>();

// ルートを登録
routesApp.route("/auth", AuthRoute); // ユーザー関連ルート

export default routesApp;
