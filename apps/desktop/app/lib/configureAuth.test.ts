import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchClient } from "./api/fetchClient";
import {
  AuthTokenStorage,
  LoginCredentials,
  SignUpCredentials,
  UserType,
  loginFn,
  logoutFn,
  registerFn,
  userFn,
} from "./configureAuth"; // Import internal functions for testing if needed, or test through exported hooks

// Mock fetchClient
vi.mock("./api/fetchClient", () => ({
  fetchClient: {
    // biome-ignore lint/style/useNamingConvention:
    GET: vi.fn(),
    // biome-ignore lint/style/useNamingConvention:
    POST: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.location.reload
Object.defineProperty(window, "location", {
  value: {
    ...window.location,
    reload: vi.fn(),
  },
  writable: true, // Allow modification
});

// Helper to get internal functions if needed, otherwise test via exported hooks/functions
// This approach accesses the internal functions directly for more focused unit tests.

describe("configureAuth", () => {
  beforeEach(() => {
    // Reset mocks and localStorage before each test
    vi.clearAllMocks();
    localStorageMock.clear();
    AuthTokenStorage.clearToken(); // Ensure clean state
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("AuthTokenStorage", () => {
    const testToken = "test-jwt-token";
    const storageKey = "mi-deck-auth-token";

    it("should set token correctly", () => {
      AuthTokenStorage.setToken(testToken);
      expect(localStorageMock.getItem(storageKey)).toBe(
        JSON.stringify(testToken),
      );
    });

    it("should get token correctly", () => {
      localStorageMock.setItem(storageKey, JSON.stringify(testToken));
      expect(AuthTokenStorage.getToken()).toBe(testToken);
    });

    it("should return null if token does not exist", () => {
      expect(AuthTokenStorage.getToken()).toBeNull();
    });

    it("should clear token correctly", () => {
      localStorageMock.setItem(storageKey, JSON.stringify(testToken));
      AuthTokenStorage.clearToken();
      expect(localStorageMock.getItem(storageKey)).toBeNull();
    });
  });

  describe("userFn", () => {
    const mockUser: UserType = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      isAuth: true,
      avatarUrl: "",
    };
    const mockToken = "valid-token";

    it("should return user data if token is valid", async () => {
      AuthTokenStorage.setToken(mockToken);
      vi.mocked(fetchClient.GET).mockResolvedValueOnce({
        data: mockUser,
        response: new Response(JSON.stringify(mockUser), { status: 200 }),
        error: undefined,
        // Add other required properties if the actual type expects them
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any); // Use 'as any' or a more specific mock type if available

      const user = await userFn();
      expect(user).toEqual({ ...mockUser, isAuth: true, avatarUrl: "" });
      expect(fetchClient.GET).toHaveBeenCalledWith("/v1/auth/me", {
        headers: { authorization: `Bearer ${mockToken}` },
      });
    });

    it("should return null if no token exists", async () => {
      const user = await userFn();
      expect(user).toBeNull();
      expect(fetchClient.GET).not.toHaveBeenCalled();
    });

    it("should return null if token is invalid (API returns error)", async () => {
      AuthTokenStorage.setToken("invalid-token");
      vi.mocked(fetchClient.GET).mockResolvedValueOnce({
        data: null,
        response: new Response(null, { status: 401 }),
        error: { message: "Unauthorized" },
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any); // Use 'as any' or a more specific mock type

      const user = await userFn();
      expect(user).toBeNull();
      expect(fetchClient.GET).toHaveBeenCalledWith("/v1/auth/me", {
        headers: { authorization: "Bearer invalid-token" },
      });
    });
  });

  describe("loginFn", () => {
    const credentials: LoginCredentials = {
      email: "test@example.com",
      password: "password",
    };
    const mockToken = "login-token";
    const mockUser: UserType = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      isAuth: true,
      avatarUrl: "",
    };

    it("should login successfully, store token, and return user", async () => {
      vi.mocked(fetchClient.POST).mockResolvedValueOnce({
        data: { accessToken: mockToken },
        response: new Response(JSON.stringify({ accessToken: mockToken }), {
          status: 200,
        }),
        error: undefined,
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any);
      vi.mocked(fetchClient.GET).mockResolvedValueOnce({
        data: mockUser,
        response: new Response(JSON.stringify(mockUser), { status: 200 }),
        error: undefined,
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any);

      const user = await loginFn(credentials);

      expect(fetchClient.POST).toHaveBeenCalledWith("/v1/auth/login", {
        body: credentials,
      });
      expect(AuthTokenStorage.getToken()).toBe(mockToken);
      expect(fetchClient.GET).toHaveBeenCalledWith("/v1/auth/me", {
        headers: { authorization: `Bearer ${mockToken}` },
      });
      expect(user).toEqual({ ...mockUser, isAuth: true, avatarUrl: "" });
    });

    it("should throw error if login API fails", async () => {
      vi.mocked(fetchClient.POST).mockResolvedValueOnce({
        data: null,
        response: new Response(null, { status: 401 }),
        error: { message: "Invalid credentials" },
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any);

      await expect(loginFn(credentials)).rejects.toThrow("Login failed");
      expect(AuthTokenStorage.getToken()).toBeNull();
      expect(fetchClient.GET).not.toHaveBeenCalled();
    });

    it("should throw error if fetching user info fails after login", async () => {
      vi.mocked(fetchClient.POST).mockResolvedValueOnce({
        data: { accessToken: mockToken },
        response: new Response(JSON.stringify({ accessToken: mockToken }), {
          status: 200,
        }),
        error: undefined,
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any);
      vi.mocked(fetchClient.GET).mockResolvedValueOnce({
        data: null,
        response: new Response(null, { status: 500 }), // Simulate failure in fetching user info
        error: { message: "Server error" },
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any);

      // Depending on implementation, it might return null or throw.
      // Based on current getuserInfo, it returns null if fetch fails.
      // The loginFn itself doesn't throw here, but handleUserResponse returns null.
      const user = await loginFn(credentials);
      expect(user).toBeNull(); // getuserInfo returns null on fetch failure
      expect(AuthTokenStorage.getToken()).toBe(mockToken); // Token is still set
      expect(fetchClient.GET).toHaveBeenCalledWith("/v1/auth/me", {
        headers: { authorization: `Bearer ${mockToken}` },
      });
    });
  });

  describe("registerFn", () => {
    const credentials: SignUpCredentials = {
      email: "new@example.com",
      password: "newpassword",
      username: "New User",
    };
    const mockToken = "register-token";
    const mockUser: UserType = {
      id: "user-2",
      email: "new@example.com",
      name: "New User",
      isAuth: true,
      avatarUrl: "",
    };

    it("should register successfully, store token, and return user", async () => {
      vi.mocked(fetchClient.POST).mockResolvedValueOnce({
        data: { accessToken: mockToken },
        response: new Response(JSON.stringify({ accessToken: mockToken }), {
          status: 201,
        }), // Assuming 201 Created
        error: undefined,
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any);
      vi.mocked(fetchClient.GET).mockResolvedValueOnce({
        data: mockUser,
        response: new Response(JSON.stringify(mockUser), { status: 200 }),
        error: undefined,
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any);

      const user = await registerFn(credentials);

      expect(fetchClient.POST).toHaveBeenCalledWith("/v1/auth/signUp", {
        body: credentials,
      });
      expect(AuthTokenStorage.getToken()).toBe(mockToken);
      expect(fetchClient.GET).toHaveBeenCalledWith("/v1/auth/me", {
        headers: { authorization: `Bearer ${mockToken}` },
      });
      expect(user).toEqual({ ...mockUser, isAuth: true, avatarUrl: "" });
    });

    it("should throw error if register API fails", async () => {
      vi.mocked(fetchClient.POST).mockResolvedValueOnce({
        data: null,
        response: new Response(null, { status: 400 }), // Assuming 400 Bad Request
        error: { message: "Registration failed" },
        // biome-ignore lint/suspicious/noExplicitAny:
      } as any);

      await expect(registerFn(credentials)).rejects.toThrow("Login failed"); // Error message might need adjustment
      expect(AuthTokenStorage.getToken()).toBeNull();
      expect(fetchClient.GET).not.toHaveBeenCalled();
    });
  });

  describe("logoutFn", () => {
    it("should clear token and reload window", async () => {
      const mockToken = "token-to-clear";
      AuthTokenStorage.setToken(mockToken);
      expect(AuthTokenStorage.getToken()).toBe(mockToken); // Verify token exists

      await logoutFn();

      expect(AuthTokenStorage.getToken()).toBeNull();
      expect(window.location.reload).toHaveBeenCalledTimes(1);
    });
  });
});
