import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  const matchMediaMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when window width is less than MOBILE_BREAKPOINT (768px)", () => {
    // Mock window innerWidth
    vi.stubGlobal("innerWidth", 500);

    // Mock matchMedia to match
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener,
      removeEventListener,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
    expect(matchMediaMock).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("should return false when window width is greater than or equal to MOBILE_BREAKPOINT (768px)", () => {
    // Mock window innerWidth
    vi.stubGlobal("innerWidth", 1024);

    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener,
      removeEventListener,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should update value when resize event occurs", () => {
    vi.stubGlobal("innerWidth", 1024);

    let changeHandler: (() => void) | undefined;
    const addEventListener = vi.fn((event, handler) => {
      if (event === "change") {
        changeHandler = handler;
      }
    });
    const removeEventListener = vi.fn();

    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener,
      removeEventListener,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile width
    act(() => {
      vi.stubGlobal("innerWidth", 500);
      if (changeHandler) changeHandler();
    });

    expect(result.current).toBe(true);
  });
});
