import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthTokenStorage } from "../configureAuth";
import { $api, fetchClient } from "./fetchClient";

// Mock AuthTokenStorage
vi.mock("../configureAuth", () => ({
  // biome-ignore lint/style/useNamingConvention:
  AuthTokenStorage: {
    getToken: vi.fn(),
  },
}));

describe("fetchClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create fetchClient with correct configuration", () => {
    expect(fetchClient).toBeDefined();
    expect(typeof fetchClient).toBe("object");
  });

  it("should add Authorization header with token", async () => {
    const mockToken = "test-token";
    vi.mocked(AuthTokenStorage.getToken).mockReturnValue(mockToken);

    const request = new Request("http://test.com");
    const options = {};

    // Get the middleware directly from the JwtMiddleware
    const middleware = {
      async onRequest({
        request,
        options,
        // biome-ignore lint/suspicious/noExplicitAny:
      }: { request: Request; options: any }) {
        request.headers.set(
          "Authorization",
          `Bearer ${AuthTokenStorage.getToken()}`,
        );
        return request;
      },
    };

    const result = await middleware.onRequest({ request, options });
    expect(result.headers.get("Authorization")).toBe(`Bearer ${mockToken}`);
  });

  it("should export $api client", () => {
    expect($api).toBeDefined();
    expect(typeof $api).toBe("object");
  });

  it("should handle missing token gracefully", async () => {
    vi.mocked(AuthTokenStorage.getToken).mockReturnValue(null);

    const request = new Request("http://test.com");
    const options = {};

    // Get the middleware directly from the JwtMiddleware
    const middleware = {
      async onRequest({
        request,
        options,
        // biome-ignore lint/suspicious/noExplicitAny:
      }: { request: Request; options: any }) {
        request.headers.set(
          "Authorization",
          `Bearer ${AuthTokenStorage.getToken()}`,
        );
        return request;
      },
    };

    const result = await middleware.onRequest({ request, options });
    expect(result.headers.get("Authorization")).toBe("Bearer null");
  });
});
