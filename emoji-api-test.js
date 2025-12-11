// Misskey Custom Emoji API テスト用スクリプト
import * as Misskey from "misskey-js";

// 利用可能な絵文字関連のAPIエンドポイントをログ出力
console.log("Misskey.js version:", "2025.6.3");

// APIクライアントの作成例
const createTestClient = () => {
  // テスト用のクライアント（認証情報は実際のものではない）
  return new Misskey.api.APIClient({
    origin: "https://example.misskey.com",
    credential: "dummy_token_for_testing",
  });
};

// 利用可能な絵文字関連のAPIエンドポイントをテスト
const testEmojiApis = async () => {
  const client = createTestClient();

  console.log("\n=== Testing Emoji API Endpoints ===\n");

  // 1. emojis エンドポイント - サーバーのカスタム絵文字一覧を取得
  console.log('1. Testing "emojis" endpoint:');
  try {
    console.log('  - Request: client.request("emojis")');
    console.log("  - Purpose: Get list of custom emojis from server");
    console.log("  - Expected response: Array of custom emoji objects");
    console.log("  - Parameters: None (empty request body)");
  } catch (error) {
    console.log("  - Error:", error.message);
  }

  // 2. emoji エンドポイント - 特定の絵文字の詳細を取得
  console.log('\n2. Testing "emoji" endpoint:');
  try {
    console.log('  - Request: client.request("emoji", { name: "emoji_name" })');
    console.log("  - Purpose: Get details of a specific custom emoji");
    console.log("  - Parameters: { name: string }");
  } catch (error) {
    console.log("  - Error:", error.message);
  }

  // 3. 管理者用の絵文字リスト
  console.log('\n3. Testing "admin/emoji/list" endpoint:');
  try {
    console.log('  - Request: client.request("admin/emoji/list", { ... })');
    console.log(
      "  - Purpose: Admin access to emoji list with management features",
    );
    console.log("  - Requires: Admin permissions");
    console.log("  - Parameters: May include pagination, filtering options");
  } catch (error) {
    console.log("  - Error:", error.message);
  }

  console.log("\n=== Emoji Data Structure ===\n");
  console.log("Expected emoji object structure:");
  console.log(`{
  name: string;           // 絵文字名（:emoji_name:形式で使用）
  category: string | null; // カテゴリ（分類用）
  aliases: string[];      // エイリアス（別名）
  url: string;           // 絵文字画像のURL
  localOnly?: boolean;   // ローカル限定かどうか
  isSensitive?: boolean; // センシティブコンテンツかどうか
  roleIdsThatCanBeUsedThisEmojiAsReaction?: string[]; // リアクションとして使用可能なロールID
}`);

  console.log("\n=== Filtering and Pagination ===\n");
  console.log("Possible parameters for emoji listing:");
  console.log("- category: Filter by category");
  console.log("- limit: Number of emojis to return");
  console.log("- sinceId/untilId: Pagination cursors");
  console.log("- query: Search query string");

  console.log("\n=== Usage for Reaction UI ===\n");
  console.log("For reaction selection UI, you would typically:");
  console.log('1. Call client.request("emojis") to get all custom emojis');
  console.log("2. Group emojis by category for organized display");
  console.log("3. Implement search/filtering functionality");
  console.log("4. Cache results for better performance");
  console.log(
    "5. Handle emoji permissions (roleIdsThatCanBeUsedThisEmojiAsReaction)",
  );
};

testEmojiApis();
