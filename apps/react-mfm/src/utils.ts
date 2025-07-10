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

export const nyaize = (text: string) => {
  return text.replace(/na/gi, (match) => {
    if (match === "Na") return "Nya";
    if (match === "NA") return "NYA";
    if (match === "nA") return "nyA";
    return "nya";
  });
};
