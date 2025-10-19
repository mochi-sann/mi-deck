import type { MisskeyThemeSetting } from "@/lib/storage/types";

type MisskeyThemeJson = {
  name?: unknown;
  base?: unknown;
  author?: unknown;
  description?: unknown;
  props?: unknown;
};

type ParsedColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

const DEFAULT_LIGHT = {
  background: "#ffffff",
  foreground: "#0f172a",
  accent: "#2563eb",
  accentForeground: "#f8fafc",
  border: "#e2e8f0",
  muted: "#f1f5f9",
  mutedForeground: "#475569",
  destructive: "#dc2626",
  info: "#0ea5e9",
  warning: "#f59e0b",
  success: "#16a34a",
  chart1: "#f97316",
  chart2: "#6366f1",
  chart3: "#10b981",
  chart4: "#8b5cf6",
  chart5: "#facc15",
};

const DEFAULT_DARK = {
  background: "#111827",
  foreground: "#f9fafb",
  accent: "#60a5fa",
  accentForeground: "#0f172a",
  border: "#1f2937",
  muted: "#1f2937",
  mutedForeground: "#94a3b8",
  destructive: "#ef4444",
  info: "#38bdf8",
  warning: "#fbbf24",
  success: "#22c55e",
  chart1: "#fb7185",
  chart2: "#34d399",
  chart3: "#60a5fa",
  chart4: "#fbbf24",
  chart5: "#a855f7",
};

const CSS_VARIABLE_KEYS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
] as const;

type CssVariableKey = (typeof CSS_VARIABLE_KEYS)[number];

type CssVariableMap = Partial<Record<CssVariableKey, string>>;

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_PATTERN =
  /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i;

const clamp = (value: number, min = 0, max = 255) =>
  Math.min(max, Math.max(min, value));

const toHex = (value: number) => value.toString(16).padStart(2, "0");

const parseHexColor = (value: string): ParsedColor | undefined => {
  const normalized = value.trim();
  const match = normalized.match(HEX_PATTERN);
  if (!match) return undefined;
  const hex = match[1];

  if (hex.length === 3 || hex.length === 4) {
    const r = Number.parseInt(hex[0] + hex[0], 16);
    const g = Number.parseInt(hex[1] + hex[1], 16);
    const b = Number.parseInt(hex[2] + hex[2], 16);
    const a = hex.length === 4 ? Number.parseInt(hex[3] + hex[3], 16) / 255 : 1;
    return { r, g, b, a };
  }

  if (hex.length === 6 || hex.length === 8) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  return undefined;
};

const parseRgbColor = (value: string): ParsedColor | undefined => {
  const match = value.trim().match(RGB_PATTERN);
  if (!match) return undefined;
  const [, rs, gs, bs, as] = match;
  const r = clamp(Number.parseFloat(rs));
  const g = clamp(Number.parseFloat(gs));
  const b = clamp(Number.parseFloat(bs));
  const a = as !== undefined ? clamp(Number.parseFloat(as), 0, 1) : 1;
  return { r, g, b, a };
};

const parseColor = (value: string): ParsedColor | undefined => {
  return parseHexColor(value) ?? parseRgbColor(value);
};

const toCssColor = ({ r, g, b, a }: ParsedColor): string => {
  const alpha = Number(Number(a).toFixed(3));
  if (alpha < 1) {
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
  }
  return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(b))}`;
};

const lightenColor = (value: string, amount: number): string => {
  const color = parseColor(value);
  if (!color) return value;
  const { r, g, b, a } = color;
  const lighten = (channel: number) =>
    clamp(Math.round(channel + (255 - channel) * amount));
  return toCssColor({ r: lighten(r), g: lighten(g), b: lighten(b), a });
};

const darkenColor = (value: string, amount: number): string => {
  const color = parseColor(value);
  if (!color) return value;
  const { r, g, b, a } = color;
  const darken = (channel: number) => clamp(Math.round(channel * (1 - amount)));
  return toCssColor({ r: darken(r), g: darken(g), b: darken(b), a });
};

const relativeLuminance = ({ r, g, b }: ParsedColor): number => {
  const srgb = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const getContrastColor = (value: string, fallback: string): string => {
  const color = parseColor(value);
  if (!color) return fallback;
  const luminance = relativeLuminance(color);
  return luminance > 0.55 ? "#0f172a" : "#f8fafc";
};

const normalizeProps = (
  props: Record<string, unknown>,
): Record<string, string> => {
  return Object.entries(props).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (typeof value === "string" && value.trim().length > 0) {
        acc[key] = value.trim();
      }
      return acc;
    },
    {},
  );
};

const pickColor = (
  props: Record<string, string>,
  keys: string[],
  fallback: string,
): string => {
  for (const key of keys) {
    const candidate = props[key];
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return fallback;
};

export const parseMisskeyTheme = (json: string): MisskeyThemeSetting => {
  let parsed: MisskeyThemeJson;
  try {
    parsed = JSON.parse(json) as MisskeyThemeJson;
  } catch (_error) {
    throw new Error("INVALID_JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("INVALID_DATA");
  }

  const base = parsed.base;
  if (base !== "light" && base !== "dark") {
    throw new Error("INVALID_BASE");
  }

  if (!parsed.props || typeof parsed.props !== "object") {
    throw new Error("INVALID_PROPS");
  }

  const props = normalizeProps(parsed.props as Record<string, unknown>);
  if (Object.keys(props).length === 0) {
    throw new Error("EMPTY_PROPS");
  }

  const name =
    typeof parsed.name === "string" && parsed.name.trim().length > 0
      ? parsed.name.trim()
      : "Custom Theme";

  const author =
    typeof parsed.author === "string" && parsed.author.trim().length > 0
      ? parsed.author.trim()
      : undefined;

  const description =
    typeof parsed.description === "string" &&
    parsed.description.trim().length > 0
      ? parsed.description.trim()
      : undefined;

  return {
    name,
    base,
    props,
    author,
    description,
  };
};

export const createCssVariablesFromMisskeyTheme = (
  theme: MisskeyThemeSetting,
): Record<string, string> => {
  const isDark = theme.base === "dark";
  const defaults = isDark ? DEFAULT_DARK : DEFAULT_LIGHT;
  const props = normalizeProps(theme.props);

  const background = pickColor(
    props,
    ["bg", "bgMain", "bgColor"],
    defaults.background,
  );
  const foreground = pickColor(
    props,
    ["fg", "fgOnAccent", "fgMain", "fgColor"],
    defaults.foreground,
  );
  const accent = pickColor(props, ["accent", "accentColor"], defaults.accent);
  const accentForeground = pickColor(
    props,
    ["fgOnAccent", "accentFg"],
    getContrastColor(accent, defaults.accentForeground),
  );

  const card = pickColor(
    props,
    ["bgPanel", "bgPanelColor", "panel"],
    isDark ? lightenColor(background, 0.08) : darkenColor(background, 0.04),
  );
  const secondary = pickColor(
    props,
    ["bgSub", "bgHover", "bgActive"],
    isDark ? lightenColor(background, 0.12) : darkenColor(background, 0.06),
  );
  const muted = pickColor(
    props,
    ["bgSub", "bgTransparent", "bgInactive"],
    isDark ? lightenColor(background, 0.18) : darkenColor(background, 0.08),
  );
  const border = pickColor(
    props,
    ["bgBorder", "border", "divider"],
    isDark ? lightenColor(background, 0.22) : darkenColor(background, 0.12),
  );
  const destructive = pickColor(
    props,
    ["danger", "warn", "error"],
    defaults.destructive,
  );
  const chart1 = pickColor(props, ["cRed", "chartRed"], defaults.chart1);
  const chart2 = pickColor(props, ["cOrange", "chartOrange"], defaults.chart2);
  const chart3 = pickColor(props, ["cYellow", "chartYellow"], defaults.chart3);
  const chart4 = pickColor(props, ["cGreen", "chartGreen"], defaults.chart4);
  const chart5 = pickColor(props, ["cBlue", "chartBlue"], defaults.chart5);

  const accentSubtle = pickColor(
    props,
    ["accentLighten", "accent2"],
    isDark ? lightenColor(accent, 0.15) : darkenColor(accent, 0.08),
  );

  const mutedForeground = pickColor(
    props,
    ["fgSub", "fgMuted"],
    isDark ? lightenColor(foreground, 0.2) : darkenColor(foreground, 0.35),
  );

  const secondaryForeground = pickColor(
    props,
    ["fgSub", "fg"],
    isDark ? lightenColor(foreground, 0.12) : darkenColor(foreground, 0.2),
  );

  const sidebar = pickColor(props, ["bgPanel", "bg"], card);

  const variables: CssVariableMap = {
    "--background": background,
    "--foreground": foreground,
    "--card": card,
    "--card-foreground": foreground,
    "--popover": card,
    "--popover-foreground": foreground,
    "--primary": accent,
    "--primary-foreground": accentForeground,
    "--secondary": secondary,
    "--secondary-foreground": secondaryForeground,
    "--muted": muted,
    "--muted-foreground": mutedForeground,
    "--accent": accent,
    "--accent-foreground": accentForeground,
    "--destructive": destructive,
    "--border": border,
    "--input": border,
    "--ring": accent,
    "--chart-1": chart1,
    "--chart-2": chart2,
    "--chart-3": chart3,
    "--chart-4": chart4,
    "--chart-5": chart5,
    "--sidebar": sidebar,
    "--sidebar-foreground": foreground,
    "--sidebar-primary": accent,
    "--sidebar-primary-foreground": accentForeground,
    "--sidebar-accent": accentSubtle,
    "--sidebar-accent-foreground": accentForeground,
    "--sidebar-border": border,
    "--sidebar-ring": accent,
  };

  CSS_VARIABLE_KEYS.forEach((key) => {
    const value = variables[key];
    if (typeof value !== "string" || value.length === 0) {
      delete variables[key];
    }
  });

  return variables as Record<string, string>;
};

export const MISSKEY_THEME_VARIABLE_KEYS: string[] = [...CSS_VARIABLE_KEYS];
