import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { Singleton } from "tstl";
import typia from "typia";

// biome-ignore lint:
export class MyGlobal {
  public static testing = false;
  public static get env(): MyGlobal.IEnvironments {
    return environments.get();
  }
}
export namespace MyGlobal {
  export interface IEnvironments {
    server_API_PORT: `${number}`;
  }
}

const environments = new Singleton(() => {
  const env = dotenv.config();
  dotenvExpand.expand(env);
  return typia.assert<MyGlobal.IEnvironments>(process.env);
});
