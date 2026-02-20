-- Add referral tracking fields to purchases table
ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "referredByUserId" TEXT;

-- Add referral code to payment_sessions table
ALTER TABLE "payment_sessions" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;

-- Create package_referral_rewards table if it doesn't exist
CREATE TABLE IF NOT EXISTS "package_referral_rewards" (
    "id" TEXT NOT NULL,
    "referrerUserId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL UNIQUE,
    "tier" TEXT NOT NULL,
    "purchaseAmountUsd" DOUBLE PRECISION NOT NULL,
    "rewardPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "rewardAmountUsd" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_referral_rewards_pkey" PRIMARY KEY ("id")
);

-- Create indexes for purchases if they don't exist
CREATE INDEX IF NOT EXISTS "purchases_referralCode_idx" ON "purchases"("referralCode");
CREATE INDEX IF NOT EXISTS "purchases_referredByUserId_idx" ON "purchases"("referredByUserId");

-- Create indexes for package_referral_rewards
CREATE UNIQUE INDEX IF NOT EXISTS "package_referral_rewards_purchaseId_key" ON "package_referral_rewards"("purchaseId");
CREATE INDEX IF NOT EXISTS "package_referral_rewards_referrerUserId_idx" ON "package_referral_rewards"("referrerUserId");
CREATE INDEX IF NOT EXISTS "package_referral_rewards_buyerUserId_idx" ON "package_referral_rewards"("buyerUserId");

-- Add foreign keys if they don't exist (checking constraints first)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE table_name='purchases' AND constraint_name='purchases_referredByUserId_fkey') THEN
        ALTER TABLE "purchases" ADD CONSTRAINT "purchases_referredByUserId_fkey"
            FOREIGN KEY ("referredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE table_name='package_referral_rewards' AND constraint_name='package_referral_rewards_referrerUserId_fkey') THEN
        ALTER TABLE "package_referral_rewards" ADD CONSTRAINT "package_referral_rewards_referrerUserId_fkey"
            FOREIGN KEY ("referrerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE table_name='package_referral_rewards' AND constraint_name='package_referral_rewards_buyerUserId_fkey') THEN
        ALTER TABLE "package_referral_rewards" ADD CONSTRAINT "package_referral_rewards_buyerUserId_fkey"
            FOREIGN KEY ("buyerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE table_name='package_referral_rewards' AND constraint_name='package_referral_rewards_purchaseId_fkey') THEN
        ALTER TABLE "package_referral_rewards" ADD CONSTRAINT "package_referral_rewards_purchaseId_fkey"
            FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
