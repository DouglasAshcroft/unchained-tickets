-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "isGenesisTicket" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EventBlockchainRegistry" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "onChainEventId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "registrationTxHash" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "chainId" INTEGER NOT NULL,
    "genesisTicketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventBlockchainRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTierBlockchainRegistry" (
    "id" SERIAL NOT NULL,
    "registryId" INTEGER NOT NULL,
    "ticketTypeId" INTEGER NOT NULL,
    "onChainTierId" INTEGER NOT NULL,
    "registrationTxHash" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTierBlockchainRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventBlockchainRegistry_eventId_key" ON "EventBlockchainRegistry"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventBlockchainRegistry_genesisTicketId_key" ON "EventBlockchainRegistry"("genesisTicketId");

-- CreateIndex
CREATE INDEX "EventBlockchainRegistry_onChainEventId_idx" ON "EventBlockchainRegistry"("onChainEventId");

-- CreateIndex
CREATE INDEX "EventBlockchainRegistry_contractAddress_chainId_idx" ON "EventBlockchainRegistry"("contractAddress", "chainId");

-- CreateIndex
CREATE INDEX "EventBlockchainRegistry_registeredAt_idx" ON "EventBlockchainRegistry"("registeredAt");

-- CreateIndex
CREATE INDEX "EventTierBlockchainRegistry_onChainTierId_idx" ON "EventTierBlockchainRegistry"("onChainTierId");

-- CreateIndex
CREATE INDEX "EventTierBlockchainRegistry_registeredAt_idx" ON "EventTierBlockchainRegistry"("registeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventTierBlockchainRegistry_registryId_ticketTypeId_key" ON "EventTierBlockchainRegistry"("registryId", "ticketTypeId");

-- CreateIndex
CREATE INDEX "Ticket_isGenesisTicket_idx" ON "Ticket"("isGenesisTicket");

-- AddForeignKey
ALTER TABLE "EventBlockchainRegistry" ADD CONSTRAINT "EventBlockchainRegistry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBlockchainRegistry" ADD CONSTRAINT "EventBlockchainRegistry_genesisTicketId_fkey" FOREIGN KEY ("genesisTicketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTierBlockchainRegistry" ADD CONSTRAINT "EventTierBlockchainRegistry_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "EventBlockchainRegistry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTierBlockchainRegistry" ADD CONSTRAINT "EventTierBlockchainRegistry_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
