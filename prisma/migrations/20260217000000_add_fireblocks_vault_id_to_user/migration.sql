-- AlterTable
ALTER TABLE "users" ADD COLUMN "fireblocksVaultId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_fireblocksVaultId_key" ON "users"("fireblocksVaultId");
