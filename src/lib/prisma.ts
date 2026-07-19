import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Prisma initialization.");
}

const pool =
  global.prismaPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 2, // サーバーレス環境での1インスタンスあたりのプール上限を最小限に設定してコネクションバーストを防ぐ
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });

const adapter = new PrismaPg(pool);

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"]
  });

global.prismaPool = pool;
global.prisma = prisma;
