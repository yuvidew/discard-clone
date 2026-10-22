import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "@/generated/prisma/client";

// Reuses one client across Next.js dev hot reloads so each reload doesn't open a new connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Creates a client whose adapter points at the same database as prisma.config.ts (the DB_* env vars).
const createPrismaClient = () => {
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
};

// Shared Prisma client for server code.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
