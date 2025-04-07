import { PrismaClient, ServerType } from "@prisma/client";
import bcrypt from "bcrypt";

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
  const NewServerSession = await prisma.serverSession.create({
    data: {
      id: "f8895928-12d9-47e6-85a3-8de88aaaa7a8",
      origin: "http://localhost:3002",
      userId: user.id,
      serverType: ServerType.Misskey,
      serverToken: "PK00RQIpfmS1diD38HCzB1Pmz055BvFG",
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
  console.log(...[user, "👀 [userAndLocalMisskey.ts:26]: user"].reverse());
  console.log(
    ...[
      NewServerSession,
      "👀 [userAndLocalMisskey.ts:25]: NewServerSession",
    ].reverse(),
  );
  console.log(
    ...[
      NewServerInfo,
      "👀 [userAndLocalMisskey.ts:48]: NewServerInfo",
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
        "👀 [MochiMissksy.ts:62]: MisskeyServerToken",
      ].reverse(),
    );
  }
};
