import bcrypt from "bcrypt";
import { PrismaClient, ServerType } from "~/generated/prisma"; // Prisma Client のインポートパスを変更

// prisma インスタンスを引数で受け取るように変更
export const userAndLocalMisskey = async (prisma: PrismaClient) => {
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
  const NewServerSession = await prisma.serverSession.create({
    data: {
      id: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
      origin: "http://localhost:3002", // Honoサーバーとポートが衝突しないように注意 (もしローカルMisskeyを立てる場合)
      userId: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
      serverType: ServerType.Misskey,
      serverToken: "PK00RQIpfmS1diD38HCzB1Pmz055BvFG", // このトークンは実際のローカルMisskeyインスタンスのものに合わせる
    },
  });
  const NewServerInfo = await prisma.serverInfo.create({
    data: {
      name: "hoge",
      faviconUrl: "",
      iconUrl: "",
      themeColor: "",
      serverSessionId: NewServerSession.id,
    },
  });
  console.log(
    ...[user, "👀 [userAndLocalMisskey.ts: Hono Seed]: user"].reverse(),
  );
  console.log(
    ...[
      NewServerSession,
      "👀 [userAndLocalMisskey.ts: Hono Seed]: NewServerSession",
    ].reverse(),
  );
  console.log(
    ...[
      NewServerInfo,
      "👀 [userAndLocalMisskey.ts: Hono Seed]: NewServerInfo",
    ].reverse(),
  );
  const LocalTimelineHome = await prisma.timeline.create({
    data: {
      name: "localhost home",
      type: "HOME",
      serverSessionId: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
    },
  });
  const LocalTimelineLocal = await prisma.timeline.create({
    data: {
      name: "localhost local",
      type: "LOCAL",
      serverSessionId: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
    },
  });
  console.log(
    ...[
      { LocalTimelineHome, LocalTimelineLocal },
      "👀 [userAndLocalMisskey.ts: Hono Seed]: {LocalTimelineHome}",
    ].reverse(),
  );
  if (process.env.MISSKEY_SERVER_TOKEN) {
    const MisskeyServerToken = await prisma.serverSession.create({
      data: {
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
        "👀 [userAndLocalMisskey.ts: Hono Seed]: MisskeyServerToken",
      ].reverse(),
    );
    const timelineHome = await prisma.timeline.create({
      data: {
        name: "Misskey Home",
        type: "HOME",
        serverSessionId: "3ae62e9f-4f08-44ef-94d5-24c4d9d5a240",
      },
    });
    console.log(
      ...[
        timelineHome,
        "👀 [userAndLocalMisskey.ts: Hono Seed]: timelines",
      ].reverse(),
    );

    const timelineLocal = await prisma.timeline.create({
      data: {
        name: "Misskey Local",
        type: "LOCAL",
        serverSessionId: "3ae62e9f-4f08-44ef-94d5-24c4d9d5a240",
      },
    });
    console.log(
      ...[
        timelineLocal,
        "👀 [userAndLocalMisskey.ts: Hono Seed]: timelineLocal",
      ].reverse(),
    );
  }
};
