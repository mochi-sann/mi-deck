// src/types.d.ts
import { Context as HonoContext } from "hono";
import { User } from "./types";

declare module "hono" {
  namespace Hono {
    interface Context {
      req: {
        user: User;
      };
    }
  }
}
