import createFetchClient from "openapi-fetch";
import { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
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
const fetchClient = createFetchClient<paths>({
  baseUrl: "/api",
});
const $api = createClient(fetchClient);

fetchClient.use(throwOnError);
export { fetchClient, $api };
