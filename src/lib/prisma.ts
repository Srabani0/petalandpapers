import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Neon's serverless driver needs a WebSocket implementation outside edge/browser
// runtimes (NFR-SCALE-02: pooling via Neon's serverless driver).
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString.includes("user:password@host")) {
    // No real Neon credentials yet (see .env.example). We still construct a
    // client so the app boots; any actual query will throw a clear error
    // instead of the app crashing at startup.
    const adapter = new PrismaNeon({ connectionString: "postgresql://placeholder" });
    return new PrismaClient({ adapter, log: ["error"] });
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
