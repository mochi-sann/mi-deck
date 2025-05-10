import { Logger } from "@nestjs/common";
import bcrypt from "bcrypt";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema"; // Drizzleスキーマ
// import { sql } from "drizzle-orm"; // 必要に応じて使用

const logger = new Logger("UserAndLocalMisskeySeed");

export const userAndLocalMisskey = async (
  db: NodePgDatabase<typeof schema>,
) => {
  const hashedPassword = await bcrypt.hash("password", 10);

  logger.log("Upserting user example2@example.com...");
  const user = await db
    .insert(schema.users)
    .values({
      email: "example2@example.com",
      password: hashedPassword,
      name: "hoge",
      userRole: "ADMIN",
    })
    .onConflictDoUpdate({
      target: schema.users.email, // email をコンフリクトターゲットに
      set: {
        name: "hoge",
        userRole: "ADMIN",
        password: hashedPassword, // パスワードも更新する場合
        updatedAt: new Date(),
      },
    })
    .returning()
    .then((res) => res[0]);

  if (!user) {
    logger.error("Failed to create or update user.");
    return;
  }
  logger.log(`User upserted: ${user.email} (ID: ${user.id})`);

  logger.log("Creating server session for localhost...");
  let newServerSession = await db
    .insert(schema.serverSessions)
    .values({
      // id: "f8895928-12d9-47e6-85a3-8de88aaaa7a8", // IDを固定する場合、valuesに含め、targetをidにする
      origin: "http://localhost:3002",
      userId: user.id,
      serverType: "Misskey",
      serverToken: "PK00RQIpfmS1diD38HCzB1Pmz055BvFG",
    })
    .onConflictOnConstraint("server_session_origin_user_id_key") // (origin, userId) の複合ユニーク制約名
    .doUpdate({
      set: {
        serverType: "Misskey",
        serverToken: "PK00RQIpfmS1diD38HCzB1Pmz055BvFG",
        updatedAt: new Date(),
      },
    })
    .returning()
    .then((res) => res[0]);

  if (!newServerSession) {
    // onConflictDoUpdate で更新された場合も結果が返るはずだが、念のためフォールバック
    newServerSession = await db.query.serverSessions.findFirst({
      where: (ss, { eq, and }) =>
        and(eq(ss.origin, "http://localhost:3002"), eq(ss.userId, user.id)),
    });
  }

  if (!newServerSession) {
    logger.error("Failed to create or get server session for localhost.");
    return;
  }
  logger.log(
    `Server session created/retrieved: ${newServerSession.origin} (ID: ${newServerSession.id})`,
  );

  logger.log("Creating server info for localhost session...");
  const newServerInfo = await db
    .insert(schema.serverInfos)
    .values({
      name: "hoge",
      faviconUrl: "",
      iconUrl: "",
      themeColor: "",
      serverSessionId: newServerSession.id,
    })
    .onConflictDoUpdate({
      target: schema.serverInfos.serverSessionId, // serverSessionId は unique
      set: {
        name: "hoge",
        faviconUrl: "",
        iconUrl: "",
        themeColor: "",
        updatedAt: new Date(),
      },
    })
    .returning()
    .then((res) => res[0]);

  if (!newServerInfo) {
    logger.error("Failed to create or update server info for localhost.");
    // newServerSession.id が存在しないケースは考えにくいが、エラーハンドリングは維持
    return;
  }
  logger.log(
    `Server info created/updated for session ID: ${newServerInfo.serverSessionId}`,
  );

  logger.log("Creating timelines for localhost session...");
  const localTimelineHome = await db
    .insert(schema.timelines)
    .values({
      name: "localhost home",
      type: "HOME",
      serverSessionId: newServerSession.id,
    })
    .onConflictDoNothing() // 主キー(id)に対するコンフリクト処理
    .returning()
    .then(async (res) => {
      if (res.length > 0) return res[0];
      // 挿入されなかった場合、既存のものを検索
      return db.query.timelines.findFirst({
        where: (t, { eq, and }) =>
          and(
            eq(t.name, "localhost home"),
            eq(t.serverSessionId, newServerSession.id!),
          ),
      });
    });

  const localTimelineLocal = await db
    .insert(schema.timelines)
    .values({
      name: "localhost local",
      type: "LOCAL",
      serverSessionId: newServerSession.id,
    })
    .onConflictDoNothing() // 主キー(id)に対するコンフリクト処理
    .returning()
    .then(async (res) => {
      if (res.length > 0) return res[0];
      // 挿入されなかった場合、既存のものを検索
      return db.query.timelines.findFirst({
        where: (t, { eq, and }) =>
          and(
            eq(t.name, "localhost local"),
            eq(t.serverSessionId, newServerSession.id!),
          ),
      });
    });

  logger.log(
    `Local timelines created/retrieved: ${localTimelineHome?.name}, ${localTimelineLocal?.name}`,
  );

  if (process.env.MISSKEY_SERVER_TOKEN && process.env.MISSKEY_SERVER_ORIGIN) {
    logger.log("Creating server session for Mochi Misskey...");
    const misskeyServerSession = await db
      .insert(schema.serverSessions)
      .values({
        id: "3ae62e9f-4f08-44ef-94d5-24c4d9d5a240", // 固定ID
        origin: process.env.MISSKEY_SERVER_ORIGIN,
        userId: user.id,
        serverType: "Misskey",
        serverToken: process.env.MISSKEY_SERVER_TOKEN,
      })
      .onConflictDoUpdate({
        target: schema.serverSessions.id, // id をコンフリクトターゲットに
        set: {
          origin: process.env.MISSKEY_SERVER_ORIGIN,
          userId: user.id, // userIdも更新対象に含めるか検討 (通常は固定IDなら不要かも)
          serverType: "Misskey",
          serverToken: process.env.MISSKEY_SERVER_TOKEN,
          updatedAt: new Date(),
        },
      })
      .returning()
      .then((res) => res[0]);

    if (!misskeyServerSession) {
      logger.error("Failed to create or get Mochi Misskey server session.");
      return;
    }
    logger.log(
      `Mochi Misskey server session created/retrieved: ${misskeyServerSession.origin} (ID: ${misskeyServerSession.id})`,
    );

    // Mochi Misskey の ServerInfo も同様に UPSERT すると良いでしょう
    // (今回は元のコードに ServerInfo の登録がなかったので省略)

    logger.log("Creating timelines for Mochi Misskey session...");
    const misskeyTimelineHome = await db
      .insert(schema.timelines)
      .values({
        name: "Misskey Home",
        type: "HOME",
        serverSessionId: misskeyServerSession.id,
      })
      .onConflictDoNothing()
      .returning()
      .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.timelines.findFirst({
          where: (t, { eq, and }) =>
            and(
              eq(t.name, "Misskey Home"),
              eq(t.serverSessionId, misskeyServerSession.id!),
            ),
        });
      });

    const misskeyTimelineLocal = await db
      .insert(schema.timelines)
      .values({
        name: "Misskey Local",
        type: "LOCAL",
        serverSessionId: misskeyServerSession.id,
      })
      .onConflictDoNothing()
      .returning()
      .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.timelines.findFirst({
          where: (t, { eq, and }) =>
            and(
              eq(t.name, "Misskey Local"),
              eq(t.serverSessionId, misskeyServerSession.id!),
            ),
        });
      });
    logger.log(
      `Mochi Misskey timelines created/retrieved: ${misskeyTimelineHome?.name}, ${misskeyTimelineLocal?.name}`,
    );
  } else {
    logger.warn(
      "MISSKEY_SERVER_TOKEN or MISSKEY_SERVER_ORIGIN is not set. Skipping Mochi Misskey seed data.",
    );
  }
  logger.log("Seeding user and local Misskey server session completed.");
};
