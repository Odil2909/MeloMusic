import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    initShadowDb: `
      CREATE SCHEMA IF NOT EXISTS neon_auth;
      CREATE TABLE neon_auth."user" (id UUID PRIMARY KEY);
    `,
  },
  datasource: {
    // Prisma CLI schema operations use Neon’s direct/unpooled URL.
    // Runtime queries use pooled DATABASE_URL in src/lib/db/prisma.ts.
    url:
      process.env.DATABASE_URL_UNPOOLED?.trim() ||
      process.env.DATABASE_URL?.trim() ||
      "",
  },
  experimental: {
    externalTables: true,
  },
  tables: {
    external: [
      "neon_auth.account",
      "neon_auth.invitation",
      "neon_auth.jwks",
      "neon_auth.member",
      "neon_auth.organization",
      "neon_auth.project_config",
      "neon_auth.session",
      "neon_auth.user",
      "neon_auth.verification",
    ],
  },
});
