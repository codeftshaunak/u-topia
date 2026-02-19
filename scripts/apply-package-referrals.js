const { PrismaClient } = require("@prisma/client");

// DATABASE_URL should be set via environment
const prisma = new PrismaClient();

async function main() {
  try {
    // Add columns to purchases table if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "purchases"
      ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
    `);
    console.log("✓ Added referralCode to purchases");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "purchases"
      ADD COLUMN IF NOT EXISTS "referredByUserId" TEXT;
    `);
    console.log("✓ Added referredByUserId to purchases");

    // Add referral code to payment_sessions
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payment_sessions"
      ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
    `);
    console.log("✓ Added referralCode to payment_sessions");

    // Create package_referral_rewards table if it doesn't exist
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log("✓ Created package_referral_rewards table");

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "purchases_referralCode_idx" ON "purchases"("referralCode");
    `);
    console.log("✓ Created purchases_referralCode_idx");

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "purchases_referredByUserId_idx" ON "purchases"("referredByUserId");
    `);
    console.log("✓ Created purchases_referredByUserId_idx");

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "package_referral_rewards_purchaseId_key"
      ON "package_referral_rewards"("purchaseId");
    `);
    console.log("✓ Created package_referral_rewards_purchaseId_key");

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "package_referral_rewards_referrerUserId_idx"
      ON "package_referral_rewards"("referrerUserId");
    `);
    console.log("✓ Created package_referral_rewards_referrerUserId_idx");

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "package_referral_rewards_buyerUserId_idx"
      ON "package_referral_rewards"("buyerUserId");
    `);
    console.log("✓ Created package_referral_rewards_buyerUserId_idx");

    // Add foreign keys if they don't exist
    const checkFk1 = await prisma.$queryRawUnsafe(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name='purchases' AND constraint_name='purchases_referredByUserId_fkey'
    `);

    if (checkFk1.length === 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "purchases"
        ADD CONSTRAINT "purchases_referredByUserId_fkey"
        FOREIGN KEY ("referredByUserId") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
      `);
      console.log("✓ Added purchases_referredByUserId_fkey");
    } else {
      console.log("✓ purchases_referredByUserId_fkey already exists");
    }

    const checkFk2 = await prisma.$queryRawUnsafe(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name='package_referral_rewards'
      AND constraint_name='package_referral_rewards_referrerUserId_fkey'
    `);

    if (checkFk2.length === 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "package_referral_rewards"
        ADD CONSTRAINT "package_referral_rewards_referrerUserId_fkey"
        FOREIGN KEY ("referrerUserId") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log("✓ Added package_referral_rewards_referrerUserId_fkey");
    } else {
      console.log("✓ package_referral_rewards_referrerUserId_fkey already exists");
    }

    const checkFk3 = await prisma.$queryRawUnsafe(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name='package_referral_rewards'
      AND constraint_name='package_referral_rewards_buyerUserId_fkey'
    `);

    if (checkFk3.length === 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "package_referral_rewards"
        ADD CONSTRAINT "package_referral_rewards_buyerUserId_fkey"
        FOREIGN KEY ("buyerUserId") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log("✓ Added package_referral_rewards_buyerUserId_fkey");
    } else {
      console.log("✓ package_referral_rewards_buyerUserId_fkey already exists");
    }

    const checkFk4 = await prisma.$queryRawUnsafe(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name='package_referral_rewards'
      AND constraint_name='package_referral_rewards_purchaseId_fkey'
    `);

    if (checkFk4.length === 0) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "package_referral_rewards"
        ADD CONSTRAINT "package_referral_rewards_purchaseId_fkey"
        FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log("✓ Added package_referral_rewards_purchaseId_fkey");
    } else {
      console.log("✓ package_referral_rewards_purchaseId_fkey already exists");
    }

    console.log("\n✅ All database migrations applied successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
