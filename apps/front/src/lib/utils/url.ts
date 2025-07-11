export const toUrl = (host: string) => {
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host;
  }
  return `https://${host}`;
};
