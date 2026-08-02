// Prisma 7 config: connection URLs live here (used by `prisma migrate`/`studio`),
// not in schema.prisma. Use the DIRECT (unpooled) Neon URL here — migrations need
// a direct connection. The app's runtime client (src/lib/prisma.ts) uses the
// pooled URL via a Neon driver adapter instead.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
  },
});
