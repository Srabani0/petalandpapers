# Petal & Papers

Full-stack e-commerce platform for Petal & Papers — a handmade, customized gift
store (scrapbooks, explosion boxes, personalized bouquets, keychains, frames,
hampers, and more). Built from the project's Blueprint and SRS documents; see
`docs/` if those get added later.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first `@theme` config in `src/app/globals.css`)
- **Database**: PostgreSQL via Prisma 7, connected through Neon's serverless
  driver adapter (`@prisma/adapter-neon`) — see `src/lib/prisma.ts`
- **Auth**: JWT + bcrypt (Phase 1)
- **Images**: Cloudinary (Phase 2+)
- **Email**: Brevo (Phase 1+)
- **Payments**: Razorpay (Phase 4)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in real values as you get them
npm run dev
```

The app boots fine with placeholder env vars — only DB-backed features will
error until you supply a real `DATABASE_URL`/`DIRECT_DATABASE_URL`.

### Database setup

1. Create a free project at [neon.tech](https://neon.tech) (no card required).
2. Copy both the **pooled** and **direct** connection strings from the Neon
   dashboard into `.env` as `DATABASE_URL` and `DIRECT_DATABASE_URL`.
3. Run `npx prisma migrate dev` to create the schema.
4. `npx prisma studio` to browse data.

Prisma 7 note: connection URLs live in `prisma.config.ts` (used by the CLI —
Migrate/Studio), not in `prisma/schema.prisma`. The app's runtime client uses
the same pooled URL via the Neon adapter.

## Project structure

```
src/app/(customer)/   customer-facing routes
src/app/(admin)/      admin dashboard routes
src/app/api/          API route handlers
src/components/ui/    base UI kit (Button, Card, Input, ...)
src/components/layout Header, Footer
src/components/home   homepage sections
src/lib/               Prisma client, utilities
src/lib/validations/   Zod schemas (added from Phase 1 on)
src/lib/email/         Brevo email adapter (added from Phase 1 on)
prisma/schema.prisma   full data model (16 models)
```

## Build status

Built phase-by-phase — see the plan for the full roadmap.

- **Phase 0 (Foundations & Design System)** — done. Project scaffold, design
  system, site shell, homepage, full Prisma schema.
- **Phase 1 (Authentication & Authorization)** — done. Register/login/logout,
  email verification, OTP password reset, JWT access + rotating refresh
  tokens (httpOnly cookies), account lockout after 5 failed attempts, admin
  RBAC via `src/proxy.ts`, admin-only seed script (`npm run db:seed`).

Connected to a live Neon database (see `.env`).
