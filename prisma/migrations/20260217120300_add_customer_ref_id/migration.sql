-- AlterTable
ALTER TABLE "payment_sessions" ADD COLUMN "customerRefId" TEXT;

-- CreateIndex
CREATE INDEX "payment_sessions_customerRefId_idx" ON "payment_sessions"("customerRefId");
