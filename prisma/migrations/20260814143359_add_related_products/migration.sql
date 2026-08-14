-- AlterTable
ALTER TABLE "products" ADD COLUMN     "relatedProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
