/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the column `lastChecked` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `ServiceHealth` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ServiceHealth` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Region` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Region` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceHealth" DROP CONSTRAINT "ServiceHealth_serviceId_fkey";

-- DropIndex
DROP INDEX "ServiceHealth_serviceId_timestamp_idx";

-- AlterTable
ALTER TABLE "Region" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "latency" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "lastChecked",
DROP COLUMN "message",
ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "ServiceHealth" DROP COLUMN "timestamp",
DROP COLUMN "updatedAt";

-- AddForeignKey
ALTER TABLE "ServiceHealth" ADD CONSTRAINT "ServiceHealth_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
