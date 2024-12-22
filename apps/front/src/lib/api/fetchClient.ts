import createFetchClient from "openapi-fetch";
import { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import { trimFirstAndLastChar } from "../../utils/trimText";
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
const CreateFetchClient = () => {
  let authToken = localStorage.getItem("jwt-token");
  if (authToken) {
    authToken = authToken.trim();
    authToken = trimFirstAndLastChar(authToken);
  }

  return createFetchClient<paths>({
    // baseUrl: "http://localhost:3001",
    baseUrl: "/api",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};
const fetchClient = CreateFetchClient();
const $api = createClient(fetchClient);

fetchClient.use(throwOnError);
export { fetchClient, $api };
