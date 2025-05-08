import { permissions } from "misskey-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GenMiAuthUrl, MiAuthReq } from "./miAuth";

describe("miAuth", () => {
  const mockOrigin = "example.com";
  const mockWindowOrigin = "http://localhost:3000";
  const mockUuid = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    // Mock window.location.origin
    Object.defineProperty(window, "location", {
      value: { origin: mockWindowOrigin },
      writable: true,
    });

    // Mock crypto.randomUUID
    vi.spyOn(crypto, "randomUUID").mockReturnValue(mockUuid);

    // Mock window.open
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GenMiAuthUrl", () => {
    it("should generate correct Miauth URL", () => {
      const { url, uuid } = GenMiAuthUrl(mockOrigin);

      // Verify UUID
      expect(uuid).toBe(mockUuid);

      // Verify URL structure
      expect(url).toBe(
        `https://${mockOrigin}/miauth/${mockUuid}?name=mi-desk-app-test&permission=${permissions.join(
          ",",
        )}&callback=${encodeURIComponent(
          `${mockWindowOrigin}/add-server/fallback/${mockOrigin}`,
        )}`,
      );
    });

    it("should handle different origins", () => {
      const customOrigin = "custom.example.com";
      const { url } = GenMiAuthUrl(customOrigin);

      expect(url).toContain(`https://${customOrigin}/miauth/`);
      expect(url).toContain(
        encodeURIComponent(
          `${mockWindowOrigin}/add-server/fallback/${customOrigin}`,
        ),
      );
    });

    it("should include all required parameters", () => {
      const { url } = GenMiAuthUrl(mockOrigin);

      // Check for required parameters
      expect(url).toContain("name=mi-desk-app-test");
      expect(url).toContain(`permission=${permissions.join(",")}`);
      expect(url).toContain("callback=");
    });
  });

  describe("MiAuthReq", () => {
    it("should open auth URL in new window and return UUID", async () => {
      const uuid = await MiAuthReq(mockOrigin);

      // Verify window.open was called with correct URL
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining(`https://${mockOrigin}/miauth/`),
        "_blank",
      );

      // Verify returned UUID
      expect(uuid).toBe(mockUuid);
    });

    it("should use the same UUID for URL and return value", async () => {
      const uuid = await MiAuthReq(mockOrigin);
      const { url } = GenMiAuthUrl(mockOrigin);

      expect(url).toContain(uuid);
    });

    it("should handle window.open failure gracefully", async () => {
      // Mock window.open to throw error
      vi.spyOn(window, "open").mockImplementation(() => {
        throw new Error("Failed to open window");
      });

      // Mock console.error to prevent error output in tests
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Should still return UUID even if window.open fails
      const uuid = await MiAuthReq(mockOrigin);
      expect(uuid).toBe(mockUuid);

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to open auth window:",
        expect.any(Error),
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
