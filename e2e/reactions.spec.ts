import { test, expect } from "@playwright/test";

// Helper to add permissive CORS headers in mock responses
const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
  "content-type": "application/json",
};

test.describe("Reactions optimistic update", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept CORS preflight for all example.com calls
    await page.route("https://example.com/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname;
      const method = request.method();

      // Handle CORS preflight
      if (method === "OPTIONS") {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }

      // Mock Misskey endpoints used by reactions
      if (path.endsWith("/api/notes/reactions/create") && method === "POST") {
        return route.fulfill({ status: 200, headers: corsHeaders, body: "{}" });
      }
      if (path.endsWith("/api/notes/reactions/delete") && method === "POST") {
        return route.fulfill({ status: 200, headers: corsHeaders, body: "{}" });
      }
      if (path.endsWith("/api/notes/reactions") && method === "POST") {
        // Return empty list for hover details
        return route.fulfill({ status: 200, headers: corsHeaders, body: "[]" });
      }

      // Fallback pass-through
      return route.fallback();
    });
  });

  test("quick reaction updates immediately", async ({ page }) => {
    await page.goto("/_authed/reaction-e2e");

    // Wait for test page ready
    await page.getByTestId("loading").waitFor({ state: "detached" });

    const mainButton = page.locator("#e2e-reaction button").first();

    // Initial count should be 0
    await expect(mainButton).toContainText("0");

    // Open popover
    await mainButton.click();

    // Click a quick reaction (❤️)
    await page.getByRole("button", { name: "❤️" }).click();

    // Count should update to 1 immediately
    await expect(mainButton).toContainText("1");

    // Clicking again should toggle off via the same flow
    await mainButton.click();
    await page.getByRole("button", { name: "❤️" }).click();
    await expect(mainButton).toContainText("0");
  });
});
