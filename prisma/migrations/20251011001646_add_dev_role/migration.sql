-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('pending', 'confirmed', 'failed', 'delayed');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'dev';

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "chargeId" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER,
    "ticketId" TEXT,
    "ticketTier" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'pending',
    "transactionHash" TEXT,
    "walletAddress" TEXT,
    "mintedTokenId" TEXT,
    "mintRetryCount" INTEGER NOT NULL DEFAULT 0,
    "mintLastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Charge_chargeId_key" ON "Charge"("chargeId");

-- CreateIndex
CREATE INDEX "Charge_chargeId_idx" ON "Charge"("chargeId");

-- CreateIndex
CREATE INDEX "Charge_userId_idx" ON "Charge"("userId");

-- CreateIndex
CREATE INDEX "Charge_eventId_idx" ON "Charge"("eventId");

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
