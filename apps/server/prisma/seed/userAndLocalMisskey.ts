import bcrypt from "bcrypt";
import { PrismaClient, ServerType } from "~/generated/prisma";

const prisma = new PrismaClient();
export const userAndLocalMisskey = async () => {
  const hashedPassword = await bcrypt.hash("password", 3);
  const user = await prisma.user.upsert({
    where: {
      email: "example2@example.com",
    },
    update: {
      id: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
      email: "example2@example.com",
    },
    create: {
      id: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
      email: "example2@example.com",
      password: hashedPassword,
      name: "hoge",
      userRole: "ADMIN",
    },
  });
  const NewServerSession = await prisma.serverSession.upsert({
    where: {
      id: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
    },
    update: {
      origin: "http://localhost:3002",
      serverType: ServerType.Misskey,
      serverToken: "PK00RQIpfmS1diD38HCzB1Pmz055BvFG",
    },
    create: {
      id: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
      origin: "http://localhost:3002",
      userId: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
      serverType: ServerType.Misskey,
      serverToken: "PK00RQIpfmS1diD38HCzB1Pmz055BvFG",
      serverInfo: {
        create: {
          name: "localhost",
          faviconUrl: "",
          iconUrl: "",
          themeColor: "",
        },
      },
      serverUserInfo: {
        create: {
          name: "hoge",
          username: "hoge",
          avatarUrl: "http://localhost:3002/identity/hote@localhost:3002",
        },
      },
    },
  });
  console.log(...[user, "👀 [userAndLocalMisskey.ts:26]: user"].reverse());
  console.log(
    ...[
      NewServerSession,
      "👀 [userAndLocalMisskey.ts:25]: NewServerSession",
    ].reverse(),
  );
  const LocalTimelineHome = await prisma.timeline.upsert({
    where: {
      id: "timeline-home-localhost",
    },
    update: {
      name: "localhost home",
      type: "HOME",
    },
    create: {
      id: "timeline-home-localhost",
      name: "localhost home",
      type: "HOME",
      serverSessionId: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
    },
  });
  const LocalTimelineLocal = await prisma.timeline.upsert({
    where: {
      id: "timeline-local-localhost",
    },
    update: {
      name: "localhost local",
      type: "LOCAL",
    },
    create: {
      id: "timeline-local-localhost",
      name: "localhost local",
      type: "LOCAL",
      serverSessionId: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
    },
  });
  console.log(
    ...[
      { LocalTimelineHome, LocalTimelineLocal },
      "👀 [userAndLocalMisskey.ts:68]: {LocalTimelineHome}",
    ].reverse(),
  );
  if (process.env.MISSKEY_SERVER_TOKEN) {
    const MisskeyServerToken = await prisma.serverSession.upsert({
      where: {
        id: "3ae62e9f-4f08-44ef-94d5-24c4d9d5a240",
      },
      update: {
        origin: "https://misskey.mochi33.com",
        serverType: ServerType.Misskey,
        serverToken: process.env.MISSKEY_SERVER_TOKEN,
      },
      create: {
        id: "3ae62e9f-4f08-44ef-94d5-24c4d9d5a240",
        origin: "https://misskey.mochi33.com",
        userId: user.id,
        serverType: ServerType.Misskey,
        serverToken: process.env.MISSKEY_SERVER_TOKEN,
      },
    });

    console.log(
      ...[
        MisskeyServerToken,
        "👀 [MochiMissksy.ts:62]: MisskeyServerToken",
      ].reverse(),
    );
    const timelineHome = await prisma.timeline.upsert({
      where: {
        id: "timeline-home-misskey",
      },
      update: {
        name: "Misskey Home",
        type: "HOME",
      },
      create: {
        id: "timeline-home-misskey",
        name: "Misskey Home",
        type: "HOME",
        serverSessionId: "3ae62e9f-4f08-44ef-94d5-24c4d9d5a240",
      },
    });
    console.log(
      ...[timelineHome, "👀 [userAndLocalMisskey.ts:79]: timelines"].reverse(),
    );

    const timelineLocal = await prisma.timeline.upsert({
      where: {
        id: "timeline-local-misskey",
      },
      update: {
        name: "Misskey Local",
        type: "LOCAL",
      },
      create: {
        id: "timeline-local-misskey",
        name: "Misskey Local",
        type: "LOCAL",
        serverSessionId: "3ae62e9f-4f08-44ef-94d5-24c4d9d5a240",
      },
    });
    console.log(
      ...[
        timelineLocal,
        "👀 [userAndLocalMisskey.ts:79]: timelineLocal",
      ].reverse(),
    );
  }
};
