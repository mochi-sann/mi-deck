import createClient, { Middleware } from "openapi-fetch";
import { paths } from "./type";

const throwOnError: Middleware = {
  async onResponse({ response }) {
    if (response.status >= 400) {
      const body = response.headers.get("content-type")?.includes("json")
        ? await response.clone().json()
        : await response.clone().text();
      throw new Error(body);
    }
    return undefined;
  },
};

const client = createClient<paths>({ baseUrl: "/api/" });
client.use(throwOnError);
export { client };
