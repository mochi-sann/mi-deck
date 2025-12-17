export const id = <T>(x: T) => x;

export const intersperse = <T>(a: T[], x: T) => {
  if (a.length <= 1) return a;
  const res = [a[0]];
  for (const i of a.slice(1)) res.push(x, i);
  return res;
};

export const isServer = typeof window === "undefined";

// Webpack detection with proper type checking
declare const __webpackRequire__: unknown;
export const isWebpack =
  typeof __webpackRequire__ !== "undefined" &&
  process.env.NODE_ENV !== "development";

export const dirname = (path: string) => path.slice(0, path.lastIndexOf("/"));

export const toUrl = (host: string) => {
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host;
  }
  return `https://${host}`;
};

const unixLikePattern = /^-?\d+$/;
const millisecondThreshold = 1_000_000_000_000;

/**
 * 整数入力を Unix time として扱い、 Date を返す.
 * 秒単位を前提にしつつ、13桁以上の値はミリ秒として扱う.
 */
export const unixTimeToDate = (
  value: number | string | null | undefined,
): Date | null => {
  if (value == null) return null;

  let numericValue: number | null = null;

  if (typeof value === "number" && Number.isFinite(value)) {
    numericValue = Math.trunc(value);
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (!unixLikePattern.test(trimmed)) return null;
    numericValue = Number.parseInt(trimmed, 10);
  }

  if (numericValue === null || !Number.isInteger(numericValue)) return null;

  const epochMillis =
    Math.abs(numericValue) >= millisecondThreshold
      ? numericValue
      : numericValue * 1000;

  const result = new Date(epochMillis);
  return Number.isNaN(result.getTime()) ? null : result;
};
