import { describe, expect, it } from "vitest";

import {
  createCssVariablesFromMisskeyTheme,
  parseMisskeyTheme,
} from "./misskey";

describe("parseMisskeyTheme", () => {
  it("parses valid Misskey theme JSON", () => {
    const json = JSON.stringify({
      name: "Test Theme",
      base: "dark",
      props: {
        accent: "#ff0000",
        bg: "#000000",
        fg: "#ffffff",
      },
    });

    const theme = parseMisskeyTheme(json);
    expect(theme).toEqual(
      expect.objectContaining({
        name: "Test Theme",
        base: "dark",
        props: {
          accent: "#ff0000",
          bg: "#000000",
          fg: "#ffffff",
        },
      }),
    );
  });

  it("throws an error for invalid JSON", () => {
    expect(() => parseMisskeyTheme("not-json")).toThrowError("INVALID_JSON");
  });
});

describe("createCssVariablesFromMisskeyTheme", () => {
  it("creates CSS variables from Misskey theme settings", () => {
    const theme = parseMisskeyTheme(
      JSON.stringify({
        name: "Sample",
        base: "light",
        props: {
          accent: "#ff5722",
          fg: "#222222",
          bg: "#fafafa",
          bgPanel: "#ffffff",
          bgSub: "#f0f0f0",
        },
      }),
    );

    const css = createCssVariablesFromMisskeyTheme(theme);
    expect(css["--background"]).toBe("#fafafa");
    expect(css["--primary"]).toBe("#ff5722");
    expect(css["--foreground"]).toBe("#222222");
  });
});
