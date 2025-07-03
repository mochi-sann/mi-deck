declare module "*.wasm" {
  const content: string;
  export default content;
}

declare module "@twemoji/api" {
  const twemoji: import("@twemoji/api/index.d.ts").Twemoji;
  export default twemoji;
}
