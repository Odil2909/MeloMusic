import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  meloPrisma?: PrismaClient;
};

export function getPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Neon Postgres is not configured. Set DATABASE_URL.");
  }

  globalForPrisma.meloPrisma ??= new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });

  return globalForPrisma.meloPrisma;
}
