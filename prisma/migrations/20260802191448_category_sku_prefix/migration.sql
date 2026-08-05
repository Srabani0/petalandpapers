-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "skuPrefix" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_skuPrefix_key" ON "categories"("skuPrefix");
