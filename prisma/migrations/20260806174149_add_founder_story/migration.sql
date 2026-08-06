-- CreateTable
CREATE TABLE "founder_story" (
    "id" TEXT NOT NULL,
    "photoUrl" TEXT,
    "heading" TEXT NOT NULL DEFAULT 'Thank You, Petal & Papers Family',
    "message" TEXT NOT NULL DEFAULT 'We started this journey with a simple mission: to bring you the finest handmade gifts with exceptional care. Every piece we offer is carefully crafted by hand, with lots of love.

Thank you for being part of our story.',
    "founderName" TEXT NOT NULL DEFAULT 'Founder',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founder_story_pkey" PRIMARY KEY ("id")
);
