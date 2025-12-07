import type { Context, Next } from 'hono';
import { PrismaClient } from '@/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";
import { env } from '@/lib/env.js';

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

export { prisma };

export function withPrisma(c: Context, next: Next) {
  if (!c.get('prisma')) {
    c.set('prisma', prisma);
  }
  return next();
}
