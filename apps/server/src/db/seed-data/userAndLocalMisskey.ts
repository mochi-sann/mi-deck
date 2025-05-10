import bcrypt from 'bcrypt';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema'; // Drizzleスキーマ
import { users, serverSessions, serverInfos, timelines } from '../schema'; 
import { Logger } from '@nestjs/common'; 

const logger = new Logger('UserAndLocalMisskeySeed');

export const userAndLocalMisskey = async (db: NodePgDatabase<typeof schema>) => {
  const hashedPassword = await bcrypt.hash('password', 10); 

  logger.log('Upserting user example2@example.com...');
  const user = await db
    .insert(users)
    .values({
      id: 'f8895928-12d9-47e6-85a3-8de88aaaa7a8', 
      email: 'example2@example.com',
      password: hashedPassword,
      name: 'hoge',
      userRole: 'ADMIN', 
    })
    .onConflict((target) => target.id) 
    .doUpdate({
      set: {
        email: 'example2@example.com', 
        name: 'hoge',
        userRole: 'ADMIN',
      },
    })
    .returning()
    .then((res) => res[0]); 

  if (!user) {
    logger.error('Failed to create or update user.');
    return;
  }
  logger.log(`User upserted: ${user.email} (ID: ${user.id})`);

  logger.log('Creating server session for localhost...');
  const newServerSession = await db
    .insert(serverSessions)
    .values({
      id: 'f8895928-12d9-47e6-85a3-8de88aaaa7a8', 
      origin: 'http://localhost:3002',
      userId: user.id,
      serverType: 'Misskey', 
      serverToken: 'PK00RQIpfmS1diD38HCzB1Pmz055BvFG', 
    })
    .onConflict((target) => target.id) 
    .doNothing() 
    .returning()
    .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.serverSessions.findFirst({ where: (ss, { eq }) => eq(ss.id, 'f8895928-12d9-47e6-85a3-8de88aaaa7a8')});
    });


  if (!newServerSession) {
    logger.error('Failed to create or get server session.');
    return;
  }
  logger.log(`Server session created/retrieved: ${newServerSession.origin} (ID: ${newServerSession.id})`);

  logger.log('Creating server info for localhost session...');
  const newServerInfo = await db
    .insert(serverInfos)
    .values({
      name: 'hoge',
      faviconUrl: '',
      iconUrl: '',
      themeColor: '',
      serverSessionId: newServerSession.id,
    })
    .onConflict((target) => target.serverSessionId) 
    .doUpdate({ 
        set: {
            name: 'hoge',
            faviconUrl: '',
            iconUrl: '',
            themeColor: '',
        }
    })
    .returning()
    .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.serverInfos.findFirst({ where: (si, { eq }) => eq(si.serverSessionId, newServerSession.id!)});
    });

  if (!newServerInfo) {
    logger.error('Failed to create or update server info.');
    return;
  }
  logger.log(`Server info created/updated for session ID: ${newServerInfo.serverSessionId}`);


  logger.log('Creating timelines for localhost session...');
  const localTimelineHome = await db
    .insert(timelines)
    .values({
      name: 'localhost home',
      type: 'HOME', 
      serverSessionId: newServerSession.id,
    })
    .onConflictDoNothing() 
    .returning()
    .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.timelines.findFirst({ where: (t, { eq, and }) => and(eq(t.name, 'localhost home'), eq(t.serverSessionId, newServerSession.id!))});
    });

  const localTimelineLocal = await db
    .insert(timelines)
    .values({
      name: 'localhost local',
      type: 'LOCAL', 
      serverSessionId: newServerSession.id,
    })
    .onConflictDoNothing()
    .returning()
    .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.timelines.findFirst({ where: (t, { eq, and }) => and(eq(t.name, 'localhost local'), eq(t.serverSessionId, newServerSession.id!))});
    });

  logger.log(`Local timelines created/retrieved: ${localTimelineHome?.name}, ${localTimelineLocal?.name}`);

  if (process.env.MISSKEY_SERVER_TOKEN && process.env.MISSKEY_SERVER_ORIGIN) {
    logger.log('Creating server session for Mochi Misskey...');
    const misskeyServerSession = await db
      .insert(serverSessions)
      .values({
        id: '3ae62e9f-4f08-44ef-94d5-24c4d9d5a240', 
        origin: process.env.MISSKEY_SERVER_ORIGIN,
        userId: user.id,
        serverType: 'Misskey',
        serverToken: process.env.MISSKEY_SERVER_TOKEN,
      })
      .onConflict((target) => target.id)
      .doNothing()
      .returning()
      .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.serverSessions.findFirst({ where: (ss, { eq }) => eq(ss.id, '3ae62e9f-4f08-44ef-94d5-24c4d9d5a240')});
      });

    if (!misskeyServerSession) {
      logger.error('Failed to create or get Mochi Misskey server session.');
      return;
    }
    logger.log(`Mochi Misskey server session created/retrieved: ${misskeyServerSession.origin} (ID: ${misskeyServerSession.id})`);

    logger.log('Creating timelines for Mochi Misskey session...');
    const misskeyTimelineHome = await db
      .insert(timelines)
      .values({
        name: 'Misskey Home',
        type: 'HOME',
        serverSessionId: misskeyServerSession.id,
      })
      .onConflictDoNothing()
      .returning()
      .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.timelines.findFirst({ where: (t, { eq, and }) => and(eq(t.name, 'Misskey Home'), eq(t.serverSessionId, misskeyServerSession.id!))});
      });


    const misskeyTimelineLocal = await db
      .insert(timelines)
      .values({
        name: 'Misskey Local',
        type: 'LOCAL',
        serverSessionId: misskeyServerSession.id,
      })
      .onConflictDoNothing()
      .returning()
      .then(async (res) => {
        if (res.length > 0) return res[0];
        return db.query.timelines.findFirst({ where: (t, { eq, and }) => and(eq(t.name, 'Misskey Local'), eq(t.serverSessionId, misskeyServerSession.id!))});
      });
    logger.log(`Mochi Misskey timelines created/retrieved: ${misskeyTimelineHome?.name}, ${misskeyTimelineLocal?.name}`);
  } else {
    logger.warn(
      'MISSKEY_SERVER_TOKEN or MISSKEY_SERVER_ORIGIN is not set. Skipping Mochi Misskey seed data.',
    );
  }
  logger.log('Seeding user and local Misskey server session completed.');
};
