import createFetchClient from "openapi-fetch";
import { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import { AuthTokenStorage } from "../configureAuth";
import { paths } from "./type";

const JwtMiddleware: Middleware = {
  async onRequest({ request, options }) {
    console.log(...[options, "👀 [fetchClient.ts:20]: options"].reverse());
    // set "foo" header
    request.headers.set(
      "Authorization",
      `Bearer ${AuthTokenStorage.getToken()}`,
    );
    return request;
  },
};
const CreateFetchClient = () => {
  return createFetchClient<paths>({
    // baseUrl: "http://localhost:3001",
    baseUrl: "/api",
  });
};
const fetchClient = CreateFetchClient();
const $api = createClient(fetchClient);

fetchClient.use(JwtMiddleware);
export { fetchClient, $api };
