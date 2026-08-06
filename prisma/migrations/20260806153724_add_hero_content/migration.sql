-- CreateTable
CREATE TABLE "hero_content" (
    "id" TEXT NOT NULL,
    "eyebrowText" TEXT NOT NULL DEFAULT 'Handcrafted · Personalized · Made with Love',
    "headingLine" TEXT NOT NULL DEFAULT 'Handmade Blooms,',
    "headingScript" TEXT NOT NULL DEFAULT 'Forever Yours',
    "description" TEXT NOT NULL DEFAULT 'Every bouquet is crocheted, arranged, and wrapped by hand — soft, everlasting blooms that never wilt, made with the same care as a gift from someone who truly knows you.',
    "primaryCtaLabel" TEXT NOT NULL DEFAULT 'Shop Collection',
    "primaryCtaHref" TEXT NOT NULL DEFAULT '/shop',
    "secondaryCtaLabel" TEXT NOT NULL DEFAULT 'Customize Bouquet',
    "secondaryCtaHref" TEXT NOT NULL DEFAULT '/shop?customizable=true',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_images" (
    "id" TEXT NOT NULL,
    "heroContentId" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "hero_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_images_heroContentId_idx" ON "hero_images"("heroContentId");

-- AddForeignKey
ALTER TABLE "hero_images" ADD CONSTRAINT "hero_images_heroContentId_fkey" FOREIGN KEY ("heroContentId") REFERENCES "hero_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
