-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Event_featured_startsAt_idx" ON "Event"("featured", "startsAt");

-- CreateIndex
CREATE INDEX "Event_featured_featuredUntil_idx" ON "Event"("featured", "featuredUntil");
