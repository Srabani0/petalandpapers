// Creates (or updates) the single admin account from env vars. Admin accounts
// are never created through public registration (FR-AUTH-06) — this seed
// script is the only way one gets made.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding.");
  }

  const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", isVerified: true },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log(`Admin ready: ${admin.email} (role: ${admin.role})`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
