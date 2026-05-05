/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Payment` table. All the data in the column will be lost.
  - The `status` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Rental` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[polarOrderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[polarCheckoutId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[proxyTokenHash]` on the table `Rental` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sellerAmount` to the `Rental` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `provider` on the `SellerToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('OPENAI', 'ANTHROPIC', 'XAI', 'GOOGLE', 'OTHER');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REVERSED');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_rentalId_fkey";

-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_sellerTokenId_fkey";

-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_sellerUserId_fkey";

-- DropForeignKey
ALTER TABLE "SellerToken" DROP CONSTRAINT "SellerToken_userId_fkey";

-- DropIndex
DROP INDEX "Payment_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "externalPaymentId" TEXT,
ADD COLUMN     "polarCheckoutId" TEXT,
ADD COLUMN     "polarOrderId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "proxyTokenHash" TEXT,
ADD COLUMN     "sellerAmount" DECIMAL(10,2) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RentalStatus" NOT NULL DEFAULT 'PENDING_PAYMENT';

-- AlterTable
ALTER TABLE "SellerToken" ADD COLUMN     "keyLabel" TEXT,
DROP COLUMN "provider",
ADD COLUMN     "provider" "AIProvider" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clerkId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RentalAccessToken" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "provider" "AIProvider" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "estimatedCost" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "externalPayoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalAccessToken_tokenHash_key" ON "RentalAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RentalAccessToken_rentalId_idx" ON "RentalAccessToken"("rentalId");

-- CreateIndex
CREATE INDEX "RentalAccessToken_expiresAt_idx" ON "RentalAccessToken"("expiresAt");

-- CreateIndex
CREATE INDEX "UsageLog_rentalId_idx" ON "UsageLog"("rentalId");

-- CreateIndex
CREATE INDEX "UsageLog_provider_idx" ON "UsageLog"("provider");

-- CreateIndex
CREATE INDEX "UsageLog_createdAt_idx" ON "UsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "UsageLog_rentalId_createdAt_idx" ON "UsageLog"("rentalId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_rentalId_key" ON "Payout"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_externalPayoutId_key" ON "Payout"("externalPayoutId");

-- CreateIndex
CREATE INDEX "Payout_sellerId_idx" ON "Payout"("sellerId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_createdAt_idx" ON "Payout"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_polarOrderId_key" ON "Payment"("polarOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_polarCheckoutId_key" ON "Payment"("polarCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_externalPaymentId_key" ON "Payment"("externalPaymentId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_proxyTokenHash_key" ON "Rental"("proxyTokenHash");

-- CreateIndex
CREATE INDEX "Rental_status_idx" ON "Rental"("status");

-- CreateIndex
CREATE INDEX "Rental_endTime_idx" ON "Rental"("endTime");

-- CreateIndex
CREATE INDEX "Rental_createdAt_idx" ON "Rental"("createdAt");

-- CreateIndex
CREATE INDEX "Rental_buyerId_status_idx" ON "Rental"("buyerId", "status");

-- CreateIndex
CREATE INDEX "Rental_sellerUserId_status_idx" ON "Rental"("sellerUserId", "status");

-- CreateIndex
CREATE INDEX "Rental_status_endTime_idx" ON "Rental"("status", "endTime");

-- CreateIndex
CREATE INDEX "SellerToken_userId_idx" ON "SellerToken"("userId");

-- CreateIndex
CREATE INDEX "SellerToken_provider_idx" ON "SellerToken"("provider");

-- CreateIndex
CREATE INDEX "SellerToken_isActive_idx" ON "SellerToken"("isActive");

-- CreateIndex
CREATE INDEX "SellerToken_expiresAt_idx" ON "SellerToken"("expiresAt");

-- CreateIndex
CREATE INDEX "SellerToken_isActive_expiresAt_idx" ON "SellerToken"("isActive", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "SellerToken" ADD CONSTRAINT "SellerToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_sellerTokenId_fkey" FOREIGN KEY ("sellerTokenId") REFERENCES "SellerToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_sellerUserId_fkey" FOREIGN KEY ("sellerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAccessToken" ADD CONSTRAINT "RentalAccessToken_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
