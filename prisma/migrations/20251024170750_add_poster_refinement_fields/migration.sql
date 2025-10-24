-- AlterTable
ALTER TABLE "EventPosterVariant" ADD COLUMN     "parentVariantId" INTEGER,
ADD COLUMN     "refinementCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refinementPrompt" TEXT,
ADD COLUMN     "refinementStrength" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PosterGenerationRequest" ADD COLUMN     "aspectRatio" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "outputFormat" TEXT,
ADD COLUMN     "parentRequestId" INTEGER,
ADD COLUMN     "refinementInstructions" TEXT,
ADD COLUMN     "refinementStrength" DOUBLE PRECISION,
ADD COLUMN     "seed" INTEGER;

-- CreateIndex
CREATE INDEX "EventPosterVariant_parentVariantId_idx" ON "EventPosterVariant"("parentVariantId");

-- CreateIndex
CREATE INDEX "PosterGenerationRequest_parentRequestId_idx" ON "PosterGenerationRequest"("parentRequestId");

-- AddForeignKey
ALTER TABLE "EventPosterVariant" ADD CONSTRAINT "EventPosterVariant_parentVariantId_fkey" FOREIGN KEY ("parentVariantId") REFERENCES "EventPosterVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosterGenerationRequest" ADD CONSTRAINT "PosterGenerationRequest_parentRequestId_fkey" FOREIGN KEY ("parentRequestId") REFERENCES "PosterGenerationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
