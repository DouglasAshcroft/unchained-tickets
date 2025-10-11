-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('general_admission', 'reserved', 'mixed');

-- CreateEnum
CREATE TYPE "SeatMapStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "SeatAvailabilityStatus" AS ENUM ('available', 'held', 'sold', 'blocked');

-- CreateTable
CREATE TABLE "VenueSeatMap" (
    "id" SERIAL PRIMARY KEY,
    "venueId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "SeatMapStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "storagePath" TEXT,
    "originalFileName" TEXT,
    "mimeType" TEXT,
    "structure" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SeatSection" (
    "id" SERIAL PRIMARY KEY,
    "seatMapId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "sortOrder" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SeatRow" (
    "id" SERIAL PRIMARY KEY,
    "sectionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "sortOrder" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SeatPosition" (
    "id" SERIAL PRIMARY KEY,
    "rowId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "displayLabel" TEXT,
    "sortOrder" INTEGER,
    "isAccessible" BOOLEAN NOT NULL DEFAULT false,
    "isObstructed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EventSeatMapAssignment" (
    "id" SERIAL PRIMARY KEY,
    "eventId" INTEGER NOT NULL,
    "seatMapId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EventTicketType" (
    "id" SERIAL PRIMARY KEY,
    "eventId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricingType" "PricingType" NOT NULL DEFAULT 'general_admission',
    "priceCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "capacity" INTEGER,
    "salesStart" TIMESTAMP(3),
    "salesEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EventReservedSeat" (
    "id" SERIAL PRIMARY KEY,
    "eventSeatMapAssignmentId" INTEGER NOT NULL,
    "seatPositionId" INTEGER NOT NULL,
    "ticketTypeId" INTEGER,
    "status" "SeatAvailabilityStatus" NOT NULL DEFAULT 'available',
    "holdExpiresAt" TIMESTAMP(3),
    "holdReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ticketTypeId" INTEGER,
ADD COLUMN     "reservedSeatId" INTEGER;

-- CreateIndex
CREATE INDEX "VenueSeatMap_venueId_idx" ON "VenueSeatMap"("venueId");

-- CreateIndex
CREATE INDEX "VenueSeatMap_status_idx" ON "VenueSeatMap"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SeatSection_seatMapId_name_key" ON "SeatSection"("seatMapId", "name");

-- CreateIndex
CREATE INDEX "SeatSection_seatMapId_idx" ON "SeatSection"("seatMapId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatRow_sectionId_name_key" ON "SeatRow"("sectionId", "name");

-- CreateIndex
CREATE INDEX "SeatRow_sectionId_idx" ON "SeatRow"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatPosition_rowId_seatNumber_key" ON "SeatPosition"("rowId", "seatNumber");

-- CreateIndex
CREATE INDEX "SeatPosition_rowId_idx" ON "SeatPosition"("rowId");

-- CreateIndex
CREATE UNIQUE INDEX "EventSeatMapAssignment_eventId_seatMapId_key" ON "EventSeatMapAssignment"("eventId", "seatMapId");

-- CreateIndex
CREATE INDEX "EventSeatMapAssignment_eventId_idx" ON "EventSeatMapAssignment"("eventId");

-- CreateIndex
CREATE INDEX "EventSeatMapAssignment_seatMapId_idx" ON "EventSeatMapAssignment"("seatMapId");

-- CreateIndex
CREATE INDEX "EventTicketType_eventId_idx" ON "EventTicketType"("eventId");

-- CreateIndex
CREATE INDEX "EventTicketType_pricingType_idx" ON "EventTicketType"("pricingType");

-- CreateIndex
CREATE INDEX "EventTicketType_isActive_idx" ON "EventTicketType"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EventReservedSeat_eventSeatMapAssignmentId_seatPositionId_key" ON "EventReservedSeat"("eventSeatMapAssignmentId", "seatPositionId");

-- CreateIndex
CREATE INDEX "EventReservedSeat_ticketTypeId_idx" ON "EventReservedSeat"("ticketTypeId");

-- CreateIndex
CREATE INDEX "EventReservedSeat_status_idx" ON "EventReservedSeat"("status");

-- CreateIndex
CREATE INDEX "Ticket_ticketTypeId_idx" ON "Ticket"("ticketTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_reservedSeatId_key" ON "Ticket"("reservedSeatId");

-- AddForeignKey
ALTER TABLE "VenueSeatMap" ADD CONSTRAINT "VenueSeatMap_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatSection" ADD CONSTRAINT "SeatSection_seatMapId_fkey" FOREIGN KEY ("seatMapId") REFERENCES "VenueSeatMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatRow" ADD CONSTRAINT "SeatRow_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SeatSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatPosition" ADD CONSTRAINT "SeatPosition_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "SeatRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSeatMapAssignment" ADD CONSTRAINT "EventSeatMapAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSeatMapAssignment" ADD CONSTRAINT "EventSeatMapAssignment_seatMapId_fkey" FOREIGN KEY ("seatMapId") REFERENCES "VenueSeatMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketType" ADD CONSTRAINT "EventTicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReservedSeat" ADD CONSTRAINT "EventReservedSeat_eventSeatMapAssignmentId_fkey" FOREIGN KEY ("eventSeatMapAssignmentId") REFERENCES "EventSeatMapAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReservedSeat" ADD CONSTRAINT "EventReservedSeat_seatPositionId_fkey" FOREIGN KEY ("seatPositionId") REFERENCES "SeatPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReservedSeat" ADD CONSTRAINT "EventReservedSeat_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_reservedSeatId_fkey" FOREIGN KEY ("reservedSeatId") REFERENCES "EventReservedSeat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
