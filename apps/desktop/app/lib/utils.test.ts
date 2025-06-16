import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should combine class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const isPrimary = false;
    expect(cn("base", isActive && "active", isPrimary && "primary")).toBe(
      "base active",
    );
  });

  it("should merge Tailwind classes correctly", () => {
    expect(cn("px-2 py-1 bg-red-500", "px-4 bg-blue-500")).toBe(
      "py-1 px-4 bg-blue-500",
    );
  });

  it("should handle array inputs", () => {
    expect(cn(["flex", "items-center"], ["justify-between"])).toBe(
      "flex items-center justify-between",
    );
  });

  it("should handle object inputs", () => {
    expect(
      cn({
        "bg-blue-500": true,
        "text-white": true,
        rounded: false,
      }),
    ).toBe("bg-blue-500 text-white");
  });

  it("should handle mixed inputs", () => {
    expect(
      cn(
        "base-class",
        ["flex", "items-center"],
        { "p-4": true, "m-2": false },
        undefined,
        null,
        "valid-class",
      ),
    ).toBe("base-class flex items-center p-4 valid-class");
  });

  it("should handle Tailwind variants correctly", () => {
    expect(
      cn("hover:bg-blue-500", "hover:bg-red-500", "sm:hover:bg-green-500"),
    ).toBe("hover:bg-red-500 sm:hover:bg-green-500");
  });

  it("should handle empty or falsy inputs", () => {
    expect(cn("", null, undefined, false, "valid-class")).toBe("valid-class");
  });
});
