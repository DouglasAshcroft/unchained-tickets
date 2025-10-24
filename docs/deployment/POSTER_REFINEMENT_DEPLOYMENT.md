# AI Poster Refinement Deployment Guide

**Feature**: AI Poster Generation with Iterative Refinement
**Migration**: `20251024170750_add_poster_refinement_fields`
**Status**: ✅ Dev database migrated, ready for production

---

## Overview

This guide covers deploying the AI poster refinement system to production (Vercel + Supabase).

### What's Being Deployed

1. **Service Enhancements** - Upgraded to Stability AI v2beta with refinement
2. **Database Schema** - Added refinement tracking fields
3. **UI Components** - New refinement dialog and workflow
4. **API Endpoints** - Updated `/api/posters/refine` endpoint
5. **Documentation** - Complete user guide

---

## Pre-Deployment Checklist

### ✅ Completed (Dev Environment)

- [x] Code implemented and tested locally
- [x] TypeScript compilation passes
- [x] Database migration created: `20251024170750_add_poster_refinement_fields`
- [x] Dev database migration applied successfully
- [x] Prisma client regenerated
- [x] Documentation created

### ⏳ Pending (Production Environment)

- [ ] Production database migration
- [ ] Vercel environment variables updated
- [ ] Production build verification
- [ ] Manual QA on production

---

## Production Deployment Steps

### Step 1: Verify Environment Variables in Vercel

**Navigate to**: Vercel Dashboard → Your Project → Settings → Environment Variables

**Ensure these are set**:

```bash
# Required for AI poster generation
STABILITY_API_KEY=sk-6nVSA9bnp9W917bU8iNhRG5xNKnPIl7cjaw6cxHrDc7x8idy

# Database URLs (already should be set)
DATABASE_URL=postgres://postgres.dyoojtzkshnjuposrobu:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
DIRECT_URL=postgres://postgres.dyoojtzkshnjuposrobu:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

# Check these are set
JWT_SECRET=[your-jwt-secret]
ADMIN_PASSWORD=[your-admin-password]
```

**Important**: Make sure `STABILITY_API_KEY` is available in **Production** scope!

### Step 2: Apply Database Migration to Production

**Option A: Via Vercel CLI** (Recommended)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull production environment variables
vercel env pull .env.production

# Apply migration using production database
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy

# Verify migration applied
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate status
```

**Option B: Via Supabase Dashboard** (If Option A fails)

1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL from `prisma/migrations/20251024170750_add_poster_refinement_fields/migration.sql`
3. Paste and run:

```sql
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
```

4. Insert into migrations table:

```sql
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  gen_random_uuid(),
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  NOW(),
  '20251024170750_add_poster_refinement_fields',
  NULL,
  NULL,
  NOW(),
  1
);
```

### Step 3: Deploy to Vercel

**Push to main branch**:

```bash
git add .
git commit -m "feat: add AI poster refinement system with v2beta API

- Upgraded to Stability AI v2beta (SD 3.5 Large)
- Added iterative refinement with plain English instructions
- New PosterRefinementDialog component
- Database schema updates for refinement tracking
- Complete documentation and user guide

Migration: 20251024170750_add_poster_refinement_fields"

git push origin main
```

**Vercel will automatically**:
1. Detect the push
2. Run build
3. Deploy to production
4. Generate new Prisma client with updated schema

**Monitor deployment**:
```bash
vercel --prod
```

Or watch in Vercel Dashboard → Deployments

### Step 4: Verify Production Deployment

**A. Check Database Schema**

```bash
# Via Vercel CLI
vercel env pull .env.production.local
DATABASE_URL="$(grep DATABASE_URL .env.production.local | cut -d '=' -f2-)" npx prisma migrate status

# Should show:
# ✓ 20251024170750_add_poster_refinement_fields applied
```

**B. Check Stability AI Integration**

1. Go to your production site
2. Navigate to Events → Create New Event
3. Fill in event details and reach "Posters" step
4. Try generating a poster
5. Verify:
   - Generation works (not placeholder)
   - "Refine This Poster" button appears
   - Refinement dialog opens
   - Can submit refinement instructions

**C. Check Database Records**

Via Supabase Dashboard → Table Editor:

```sql
-- Check new columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'EventPosterVariant'
AND column_name IN ('parentVariantId', 'refinementCount', 'refinementPrompt', 'refinementStrength');

-- Should return 4 rows

SELECT column_name
FROM information_schema.columns
WHERE table_name = 'PosterGenerationRequest'
AND column_name IN ('model', 'aspectRatio', 'seed', 'outputFormat', 'parentRequestId', 'refinementInstructions', 'refinementStrength');

-- Should return 7 rows
```

### Step 5: Monitor Initial Usage

**Watch for**:

1. **Stability AI API Errors**
   - Check Vercel logs: `vercel logs`
   - Look for: `[PosterGeneration]` logs
   - Common issues: API key, rate limits, credits

2. **Database Queries**
   - Supabase Dashboard → Logs
   - Monitor slow queries on new indexes

3. **Cost Tracking**
   - Stability AI Dashboard → Usage
   - Expected: $0.03-0.04 per poster
   - Alert if usage spikes unexpectedly

---

## Rollback Plan

If issues occur, you can rollback the migration:

### Option 1: Revert Git Commit

```bash
git revert HEAD
git push origin main
```

Vercel will auto-deploy the previous version (UI/API rolled back).

### Option 2: Rollback Database Migration

**⚠️ WARNING**: This will delete refinement data!

```sql
-- Remove foreign keys
ALTER TABLE "EventPosterVariant" DROP CONSTRAINT IF EXISTS "EventPosterVariant_parentVariantId_fkey";
ALTER TABLE "PosterGenerationRequest" DROP CONSTRAINT IF EXISTS "PosterGenerationRequest_parentRequestId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "EventPosterVariant_parentVariantId_idx";
DROP INDEX IF EXISTS "PosterGenerationRequest_parentRequestId_idx";

-- Remove columns from EventPosterVariant
ALTER TABLE "EventPosterVariant"
  DROP COLUMN IF EXISTS "parentVariantId",
  DROP COLUMN IF EXISTS "refinementCount",
  DROP COLUMN IF EXISTS "refinementPrompt",
  DROP COLUMN IF EXISTS "refinementStrength";

-- Remove columns from PosterGenerationRequest
ALTER TABLE "PosterGenerationRequest"
  DROP COLUMN IF EXISTS "aspectRatio",
  DROP COLUMN IF EXISTS "model",
  DROP COLUMN IF EXISTS "outputFormat",
  DROP COLUMN IF EXISTS "parentRequestId",
  DROP COLUMN IF EXISTS "refinementInstructions",
  DROP COLUMN IF EXISTS "refinementStrength",
  DROP COLUMN IF EXISTS "seed";

-- Remove from migrations table
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20251024170750_add_poster_refinement_fields';
```

---

## Post-Deployment Testing

### Test Scenarios

**1. Initial Generation**
- [ ] Create event with 3 tiers (GA, Premium, VIP)
- [ ] Generate posters with "Vintage" style
- [ ] Add custom prompt: "include electric guitars"
- [ ] Verify posters generate successfully
- [ ] Check tier-specific enhancements (VIP has gold accents)

**2. Refinement Flow**
- [ ] Click "Refine This Poster" on VIP poster
- [ ] Enter: "make it darker and add more purple"
- [ ] Select "Core" model
- [ ] Generate refined version
- [ ] Verify new variant appears in gallery
- [ ] Original poster still exists

**3. Multiple Iterations**
- [ ] Refine the refined version
- [ ] Enter: "add stage lighting effects"
- [ ] Verify 3rd variant appears
- [ ] All 3 versions preserved

**4. Approval Flow**
- [ ] Approve final refined version
- [ ] Proceed to next step
- [ ] Verify event creation succeeds
- [ ] Check database for approved poster

**5. Error Handling**
- [ ] Temporarily remove STABILITY_API_KEY
- [ ] Try to generate poster
- [ ] Verify graceful fallback to placeholder
- [ ] Restore API key

---

## Monitoring & Alerts

### Set Up Alerts

**1. Vercel Monitoring**

Go to Vercel Dashboard → Your Project → Analytics

Set alerts for:
- API errors > 5 per hour
- Response time > 30 seconds
- Build failures

**2. Stability AI Monitoring**

Go to platform.stability.ai → Usage

Set alerts for:
- Daily spend > $10
- Rate limit warnings
- API errors

**3. Supabase Monitoring**

Go to Supabase Dashboard → Database → Performance

Monitor:
- Query performance on new indexes
- Connection pool usage
- Storage usage (posters are base64)

### Key Metrics to Track

```
Week 1:
- Total posters generated
- Average refinements per poster
- API success rate
- Average generation time
- Total cost

Week 2:
- User adoption (% using refinement)
- Most common refinement instructions
- Ultra vs Core usage split
- Approval rate (after refinement)
```

---

## Known Limitations

1. **Storage**: Posters stored as base64 data URIs (~1.5MB each)
   - **Future**: Migrate to IPFS/CDN for better performance

2. **API Rate Limits**: Stability AI has rate limits
   - **Current**: Reasonable for MVP usage
   - **Future**: Implement queue system for high volume

3. **Generation Time**: Ultra model takes ~30 seconds
   - **Workaround**: Use Core for iteration, Ultra for finals

4. **Cost**: $0.03-0.04 per poster
   - **Mitigation**: Documented optimization strategies

---

## Support & Troubleshooting

### Common Issues

**Issue**: "API key not configured"
- **Solution**: Verify `STABILITY_API_KEY` in Vercel env vars
- **Scope**: Must be in Production scope

**Issue**: "Base variant not found"
- **Solution**: Migration not applied, check database schema
- **Fix**: Re-run migration (Step 2 above)

**Issue**: Posters are placeholders
- **Solution**: Either API key missing or invalid
- **Check**: platform.stability.ai → API Keys

**Issue**: Slow generation
- **Expected**: 10-30 seconds depending on model
- **Workaround**: Use Core model, reserve Ultra for finals

### Getting Help

**Documentation**:
- User Guide: `/docs/features/AI_POSTER_GENERATION.md`
- API Reference: Stability AI docs
- Prisma Migrations: `prisma.io/docs/migrations`

**Logs**:
```bash
# Vercel logs
vercel logs --follow

# Filter for poster generation
vercel logs | grep PosterGeneration
```

**Database Queries**:
```bash
# Connect to production DB
npx prisma studio --browser none
```

---

## Success Criteria

Deployment is successful when:

- [x] ✅ Dev database migrated
- [ ] Production database migrated
- [ ] Environment variables configured
- [ ] Vercel deployment succeeds
- [ ] Can generate posters on production
- [ ] Can refine posters on production
- [ ] No errors in Vercel logs
- [ ] Stability AI API responds correctly
- [ ] Cost tracking shows expected usage

---

## Next Steps After Deployment

1. **Monitor for 24 hours** - Watch logs and usage
2. **Gather user feedback** - Ask venues to test
3. **Optimize based on data** - Adjust based on usage patterns
4. **Plan Phase 2 enhancements** - IPFS, batch operations, etc.

---

**Deployment Date**: _[To be filled]_
**Deployed By**: _[Your name]_
**Status**: ✅ Ready for production deployment

---

**Questions?** Contact the development team or refer to the user guide.
