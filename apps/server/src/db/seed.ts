import { parseArgs } from 'node:util';
import { Pool } from 'pg';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema'; // Drizzleスキーマ
import { userAndLocalMisskey } from './seed-data/userAndLocalMisskey'; 
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

// .envの読み込み (migrate.tsと同様)
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '../../.env.test' : '../../.env' });

const logger = new Logger('SeedScript');

const optionsHelp = {
  environment: { type: 'string' as const }, 
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options: optionsHelp, strict: false }); 
  logger.log(`Seeding for environment: ${environment}`);

  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });

  try {
    switch (environment) {
      case 'production':
        logger.log('Production seeding (typically no-op or minimal)');
        break;

      case 'development':
        logger.log('Development seeding...');
        await userAndLocalMisskey(db); 
        logger.log('Development seeding completed.');
        break;

      case 'local': 
        logger.log('Local seeding (no-op)');
        break;

      case 'test':
        logger.log('Test seeding...');
        await userAndLocalMisskey(db); 
        logger.log('Test seeding completed.');
        break;
      default:
        logger.warn(`Unknown environment for seeding: ${environment}`);
        break;
    }
  } catch (error) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await pool.end();
    logger.log('Database connection closed after seeding.');
  }
}

main().catch(async (e) => {
  logger.error('Unhandled error in seed script:', e);
  process.exit(1);
});
