import { describe, expect, it } from "vitest";
import { toUrl } from "./url";

describe("toUrl", () => {
  it("should prefix with https:// if no protocol is present", () => {
    expect(toUrl("example.com")).toBe("https://example.com");
  });

  it("should not change if http:// is already present", () => {
    expect(toUrl("http://example.com")).toBe("http://example.com");
  });
  it("localhost", () => {
    expect(toUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("should not change if https:// is already present", () => {
    expect(toUrl("https://example.com")).toBe("https://example.com");
  });

  it("should handle empty string", () => {
    // Logic: if empty, startsWith is false -> https://
    expect(toUrl("")).toBe("https://");
  });
});
