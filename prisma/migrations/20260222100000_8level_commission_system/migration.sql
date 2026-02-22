-- AlterEnum: Add new tier values to AffiliateTier
ALTER TYPE "AffiliateTier" ADD VALUE IF NOT EXISTS 'elite';
ALTER TYPE "AffiliateTier" ADD VALUE IF NOT EXISTS 'legend';
ALTER TYPE "AffiliateTier" ADD VALUE IF NOT EXISTS 'titan';

-- AlterTable: Add level and maxDepth columns to packages
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "max_depth" INTEGER NOT NULL DEFAULT 1;

-- CreateTable: package_upgrades
CREATE TABLE IF NOT EXISTS "package_upgrades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromPackage" TEXT NOT NULL,
    "toPackage" TEXT NOT NULL,
    "fromPriceUsd" DOUBLE PRECISION NOT NULL,
    "toPriceUsd" DOUBLE PRECISION NOT NULL,
    "differenceUsd" DOUBLE PRECISION NOT NULL,
    "purchaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_upgrades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "package_upgrades_userId_idx" ON "package_upgrades"("userId");

-- Update existing packages with correct level and maxDepth
UPDATE "packages" SET "level" = 1, "max_depth" = 1 WHERE LOWER("name") = 'bronze';
UPDATE "packages" SET "level" = 2, "max_depth" = 2 WHERE LOWER("name") = 'silver';
UPDATE "packages" SET "level" = 3, "max_depth" = 3 WHERE LOWER("name") = 'gold';
UPDATE "packages" SET "level" = 4, "max_depth" = 4 WHERE LOWER("name") = 'platinum';
UPDATE "packages" SET "level" = 5, "max_depth" = 5 WHERE LOWER("name") = 'diamond';
