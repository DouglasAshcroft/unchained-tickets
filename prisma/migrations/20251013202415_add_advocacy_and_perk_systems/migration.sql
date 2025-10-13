-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "advocacyCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clickThroughs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estimatedAdValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "eventSource" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN     "impressions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastImpressionAt" TIMESTAMP(3),
ADD COLUMN     "originalTicketUrl" TEXT,
ADD COLUMN     "venueContactEmail" TEXT;

-- AlterTable
ALTER TABLE "WaitlistSignup" ADD COLUMN     "advocacyCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentTier" TEXT NOT NULL DEFAULT 'starter',
ADD COLUMN     "totalVenuesReached" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TicketPerk" (
    "id" SERIAL NOT NULL,
    "ticketTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketPerk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketPerkRedemption" (
    "id" SERIAL NOT NULL,
    "ticketId" TEXT NOT NULL,
    "ticketPerkId" INTEGER NOT NULL,
    "redeemedQuantity" INTEGER NOT NULL DEFAULT 0,
    "lastRedeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketPerkRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventImpression" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "referrer" TEXT,
    "clickedThrough" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvocacyRequest" (
    "id" SERIAL NOT NULL,
    "email" CITEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "venueName" TEXT NOT NULL,
    "venueEmail" TEXT,
    "userMessage" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvocacyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueMarketingValue" (
    "id" SERIAL NOT NULL,
    "venueName" TEXT NOT NULL,
    "venueEmail" TEXT,
    "totalImpressions" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalAdvocates" INTEGER NOT NULL DEFAULT 0,
    "estimatedAdValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weeklyImpressions" INTEGER NOT NULL DEFAULT 0,
    "monthlyImpressions" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueMarketingValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueSupportSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "supportedVenueId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueSupportSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" INTEGER,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketPerk_ticketTypeId_idx" ON "TicketPerk"("ticketTypeId");

-- CreateIndex
CREATE INDEX "TicketPerkRedemption_ticketPerkId_idx" ON "TicketPerkRedemption"("ticketPerkId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketPerkRedemption_ticketId_ticketPerkId_key" ON "TicketPerkRedemption"("ticketId", "ticketPerkId");

-- CreateIndex
CREATE INDEX "EventImpression_eventId_idx" ON "EventImpression"("eventId");

-- CreateIndex
CREATE INDEX "EventImpression_sessionId_idx" ON "EventImpression"("sessionId");

-- CreateIndex
CREATE INDEX "EventImpression_createdAt_idx" ON "EventImpression"("createdAt");

-- CreateIndex
CREATE INDEX "AdvocacyRequest_email_idx" ON "AdvocacyRequest"("email");

-- CreateIndex
CREATE INDEX "AdvocacyRequest_eventId_idx" ON "AdvocacyRequest"("eventId");

-- CreateIndex
CREATE INDEX "AdvocacyRequest_emailSent_idx" ON "AdvocacyRequest"("emailSent");

-- CreateIndex
CREATE INDEX "AdvocacyRequest_createdAt_idx" ON "AdvocacyRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VenueMarketingValue_venueName_key" ON "VenueMarketingValue"("venueName");

-- CreateIndex
CREATE INDEX "VenueMarketingValue_venueName_idx" ON "VenueMarketingValue"("venueName");

-- CreateIndex
CREATE INDEX "VenueSupportSession_userId_endedAt_idx" ON "VenueSupportSession"("userId", "endedAt");

-- CreateIndex
CREATE INDEX "VenueSupportSession_supportedVenueId_idx" ON "VenueSupportSession"("supportedVenueId");

-- CreateIndex
CREATE INDEX "VenueSupportSession_startedAt_idx" ON "VenueSupportSession"("startedAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_userId_createdAt_idx" ON "AdminAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Event_eventSource_idx" ON "Event"("eventSource");

-- AddForeignKey
ALTER TABLE "TicketPerk" ADD CONSTRAINT "TicketPerk_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketPerkRedemption" ADD CONSTRAINT "TicketPerkRedemption_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketPerkRedemption" ADD CONSTRAINT "TicketPerkRedemption_ticketPerkId_fkey" FOREIGN KEY ("ticketPerkId") REFERENCES "TicketPerk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventImpression" ADD CONSTRAINT "EventImpression_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvocacyRequest" ADD CONSTRAINT "AdvocacyRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvocacyRequest" ADD CONSTRAINT "AdvocacyRequest_email_fkey" FOREIGN KEY ("email") REFERENCES "WaitlistSignup"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueSupportSession" ADD CONSTRAINT "VenueSupportSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueSupportSession" ADD CONSTRAINT "VenueSupportSession_supportedVenueId_fkey" FOREIGN KEY ("supportedVenueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
