import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, path } = req;
    const startTime = Date.now();

    res.on("finish", () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(
        `[${method}] ${url} ${path} - ${res.statusCode} (${duration}ms)`,
      );
    });

    next();
  }
}
