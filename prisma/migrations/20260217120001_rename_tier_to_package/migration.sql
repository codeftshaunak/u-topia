-- AlterTable
ALTER TABLE "users" RENAME COLUMN "currentTier" TO "currentPackage";
ALTER TABLE "users" RENAME COLUMN "tierActivatedAt" TO "packageActivatedAt";
