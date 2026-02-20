-- AlterTable: Add referredByUserId to users for permanent referral chain
ALTER TABLE "users" ADD COLUMN "referredByUserId" TEXT;

-- CreateIndex: Index on referredByUserId for fast chain lookups
CREATE INDEX "users_referredByUserId_idx" ON "users"("referredByUserId");

-- AddForeignKey: Self-referencing relation for referral chain
ALTER TABLE "users" ADD CONSTRAINT "users_referredByUserId_fkey" FOREIGN KEY ("referredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: Migrate existing Referral records to populate referredByUserId on users
-- Only set for users who don't already have a referrer
UPDATE "users" u
SET "referredByUserId" = r."referrerUserId"
FROM "referrals" r
WHERE r."referredUserId" = u."id"
  AND r."status" != 'invalid'
  AND u."referredByUserId" IS NULL;
