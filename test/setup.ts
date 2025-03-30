import { afterAll, beforeAll } from 'vitest';
import { PrismaService } from '~/lib/prisma.service';

let prisma: PrismaService;

beforeAll(async () => {
  prisma = new PrismaService();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
