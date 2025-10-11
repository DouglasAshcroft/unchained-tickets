-- CreateEnum
CREATE TYPE "VenueChecklistTask" AS ENUM ('seat_map', 'poster_workflow', 'staff_accounts', 'payout_details');

-- CreateTable
CREATE TABLE "VenueChecklistStatus" (
    "id" SERIAL PRIMARY KEY,
    "venueId" INTEGER NOT NULL,
    "task" "VenueChecklistTask" NOT NULL,
    "completedAt" TIMESTAMP(3),
    "completedBy" INTEGER,
    CONSTRAINT "VenueChecklistStatus_venueId_task_key" UNIQUE ("venueId", "task")
);

-- CreateIndex
CREATE INDEX "VenueChecklistStatus_task_idx" ON "VenueChecklistStatus"("task");

-- AddForeignKey
ALTER TABLE "VenueChecklistStatus" ADD CONSTRAINT "VenueChecklistStatus_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueChecklistStatus" ADD CONSTRAINT "VenueChecklistStatus_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
