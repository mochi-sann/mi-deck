import { permissions } from "misskey-js";
import { join } from "node:path/posix";

export const MiAuthReq = async (origin: string): Promise<string> => {
  const param = {
    name: "mi-desk-app",
    permission: permissions,
  };

  // quickMiAuth is wrapper for get MiAuth instance quickly
  const miauth = quickAuth(origin, param);
  // const token = await miauth.getToken()

  // call when done authentication
  // console.log(await miauth.getToken())

  // access to the this url, verify authentication
  console.log(miauth.authUrl());

  // Please click the link within 10 seconds to complete the authentication process.

  // then you assignment token like this
  const token = await miauth.getToken();
  console.log(`🔑 Your Token here \n${token}`);
  return token;
};

// If the authentication is successful, the token will be displayed.

/**
 * parameter of MiAuth url
 */
export interface UrlParam {
  name: string;
  callback?: string;
  icon?: URL | string;
  permission: typeof permissions;
}

/**
 * throw when incorrect format url parameter hand over MiAuth class
 */
class UrlParameterError extends Error {
  constructor() {
    // TODO: ここに気の利いたエラーを入れる
    super("UrlParameterError");
  }
}

class AuthenticationError extends Error {
  constructor() {
    // TODO: ここに気の利いたエラーを入れる
    super("AuthenticationError");
  }
}

export class MiAuth {
  /**
   * MiAuth constructor
   *
   * origin:
   *   your on the instance url
   *
   * param:
   *   url parameter. see UrlParam
   */

  private origin: string;
  private param: UrlParam;
  private session: string;

  constructor(origin: string, param: UrlParam, session: string) {
    this.origin = origin;
    this.param = param;
    this.session = session;
  }

  /**
   * return miauth authentication url
   */
  public authUrl(): string {
    const param = this.buildParam(this.param);
    const requestUrl = new URL(join("miauth", this.session), this.origin);

    requestUrl.search = param;
    return requestUrl.toString();
  }

  /**
   * return misskey api token
   * when failed authentication, throw AuthenticationError
   */
  public getToken(): Promise<string> {
    return MiAuth.getToken(this.origin, this.session);
  }

  /**
   * return misskey api token
   * when failed authentication, throw AuthenticationError
   */
  public static async getToken(
    origin: string,
    session: string,
  ): Promise<string> {
    const url = new URL(join("api", "miauth", session, "check"), origin);

    const data: Record<string, unknown> = await ky.post(url).json();
    const token = String(data.token);

    if (typeof data.token === "undefined") {
      throw new AuthenticationError();
    }

    return token;
  }

  /**
   * build for parameter of miauth authentication url
   * when you incorrect parameter, throw UrlParameterError,
   * but, when callback parameter incorrect do not throw that error
   */
  private buildParam(param: UrlParam): string {
    const urlParam: Record<string, string> = {
      name: param.name,
      callback: param.callback as string,
      icon: (typeof param.icon === "string"
        ? param.icon
        : param.icon?.toString()) as string,
      permission: param.permission.join(","),
    };

    const convertedParam = new URLSearchParams();

    Object.keys(urlParam).forEach((key) => {
      convertedParam.set(key, String(urlParam[key]));
      if (key != "callback") {
        if (typeof urlParam[key] === "undefined") {
          throw UrlParameterError;
        }
      } else {
        if (typeof urlParam[key] === "undefined") {
          convertedParam.delete("callback");
        }
      }
    });
    return convertedParam.toString();
  }
}

/**
 *  this is MiAuth constructor light wrapper
 */
export function quickAuth(origin: string, param: UrlParam): MiAuth {
  const session = crypto.randomUUID();
  return new MiAuth(origin, param, session);
}
