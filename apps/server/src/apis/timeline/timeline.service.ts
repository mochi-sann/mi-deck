import { Injectable, UnauthorizedException } from "@nestjs/common";
import { APIClient } from "misskey-js/api.js";
import { PrismaService } from "~/lib/prisma.service";

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string, userId: string) {
    const serverSession = await this.prisma.serverSession.findUnique({
      where: {
        id: id,
      },
    });
    console.log(
      ...[
        serverSession,
        "👀 [timeline.service.ts:19]: serverSession",
      ].reverse(),
    );
    const client = new APIClient({
      origin: serverSession.origin,
      credential: serverSession.serverToken,
    });
    const Timeline = await client
      .request("notes/timeline", {
        limit: 100,
      })
      .then((res) => res)
      .catch((err) => {
        console.log(err);
        throw new UnauthorizedException("can not get server info");
      });
    console.log(Timeline);

    return Timeline;
  }
}
