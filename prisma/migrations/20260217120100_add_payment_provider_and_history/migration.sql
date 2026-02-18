-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('fireblocks', 'stripe', 'manual');

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN "provider" "PaymentProvider" NOT NULL DEFAULT 'fireblocks';

-- AlterTable
ALTER TABLE "payment_sessions" ADD COLUMN "provider" "PaymentProvider" NOT NULL DEFAULT 'fireblocks';

-- CreateTable
CREATE TABLE "transaction_history" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "userId" TEXT,
    "provider" "PaymentProvider" NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "subStatus" TEXT,
    "eventType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "amountUsd" DOUBLE PRECISION,
    "networkFee" DOUBLE PRECISION,
    "currency" TEXT,
    "txHash" TEXT,
    "sourceAddress" TEXT,
    "destinationAddress" TEXT,
    "blockHeight" TEXT,
    "blockHash" TEXT,
    "confirmations" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_history_purchaseId_idx" ON "transaction_history"("purchaseId");

-- CreateIndex
CREATE INDEX "transaction_history_transactionId_idx" ON "transaction_history"("transactionId");

-- CreateIndex
CREATE INDEX "transaction_history_userId_idx" ON "transaction_history"("userId");

-- AddForeignKey
ALTER TABLE "transaction_history" ADD CONSTRAINT "transaction_history_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
