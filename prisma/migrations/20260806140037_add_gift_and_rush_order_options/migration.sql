-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "giftMessage" TEXT,
ADD COLUMN     "giftWrap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "giftWrapFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "isRushOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rushFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledDeliveryDate" TIMESTAMP(3);
