/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[walletAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VenueStaffRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'SCANNER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "createdViaOnramp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultPaymentMethodId" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "favoriteGenres" TEXT[],
ADD COLUMN     "latitude" DECIMAL(9,6),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "locationEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "longitude" DECIMAL(9,6),
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "walletAddress" TEXT,
ADD COLUMN     "walletProvider" TEXT;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteArtist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueStaff" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "VenueStaffRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "invitedBy" INTEGER,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPosterVariant" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "ticketTypeId" INTEGER,
    "variantName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "rarityMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "generationPrompt" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPosterVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosterGenerationRequest" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "ticketTypeId" INTEGER,
    "prompt" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "resultImageUrl" TEXT,
    "errorMessage" TEXT,
    "estimatedCostCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PosterGenerationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "FavoriteArtist_userId_idx" ON "FavoriteArtist"("userId");

-- CreateIndex
CREATE INDEX "FavoriteArtist_artistId_idx" ON "FavoriteArtist"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteArtist_userId_artistId_key" ON "FavoriteArtist"("userId", "artistId");

-- CreateIndex
CREATE INDEX "VenueStaff_venueId_idx" ON "VenueStaff"("venueId");

-- CreateIndex
CREATE INDEX "VenueStaff_userId_idx" ON "VenueStaff"("userId");

-- CreateIndex
CREATE INDEX "VenueStaff_role_idx" ON "VenueStaff"("role");

-- CreateIndex
CREATE INDEX "VenueStaff_invitedBy_idx" ON "VenueStaff"("invitedBy");

-- CreateIndex
CREATE UNIQUE INDEX "VenueStaff_venueId_userId_key" ON "VenueStaff"("venueId", "userId");

-- CreateIndex
CREATE INDEX "EventPosterVariant_eventId_idx" ON "EventPosterVariant"("eventId");

-- CreateIndex
CREATE INDEX "EventPosterVariant_eventId_ticketTypeId_idx" ON "EventPosterVariant"("eventId", "ticketTypeId");

-- CreateIndex
CREATE INDEX "EventPosterVariant_isApproved_idx" ON "EventPosterVariant"("isApproved");

-- CreateIndex
CREATE INDEX "PosterGenerationRequest_eventId_status_idx" ON "PosterGenerationRequest"("eventId", "status");

-- CreateIndex
CREATE INDEX "PosterGenerationRequest_venueId_idx" ON "PosterGenerationRequest"("venueId");

-- CreateIndex
CREATE INDEX "PosterGenerationRequest_status_idx" ON "PosterGenerationRequest"("status");

-- CreateIndex
CREATE INDEX "PosterGenerationRequest_createdAt_idx" ON "PosterGenerationRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_createdViaOnramp_idx" ON "User"("createdViaOnramp");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteArtist" ADD CONSTRAINT "FavoriteArtist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteArtist" ADD CONSTRAINT "FavoriteArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueStaff" ADD CONSTRAINT "VenueStaff_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueStaff" ADD CONSTRAINT "VenueStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueStaff" ADD CONSTRAINT "VenueStaff_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPosterVariant" ADD CONSTRAINT "EventPosterVariant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPosterVariant" ADD CONSTRAINT "EventPosterVariant_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosterGenerationRequest" ADD CONSTRAINT "PosterGenerationRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosterGenerationRequest" ADD CONSTRAINT "PosterGenerationRequest_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
