# Unchained Tickets – Operations Runbook

## Prisma Migrations
1. Update prisma schema: `prisma/schema.prisma`.
2. Format schema: `npx prisma format`.
3. Generate SQL: `npx prisma migrate dev --name descriptive-name` (development) or `npx prisma migrate deploy` (production).
4. Regenerate client: `npx prisma generate`.
5. Verify: `npx prisma studio` or application smoke tests.

## Environment Variables
Set the following in deployment (Vercel, Railway, etc.):
- `DATABASE_URL` / `DIRECT_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
- `COINBASE_COMMERCE_API_KEY`
- `COINBASE_WEBHOOK_SECRET`
- `BASE_RPC_URL` (or `NEXT_PUBLIC_BASE_RPC_URL`)
- `MINTING_PRIVATE_KEY`
- `NFT_CONTRACT_ADDRESS` (and optionally `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`)
- `NEXT_PUBLIC_DEV_MODE` (set to `false` in production)
- `MINT_MAX_RETRIES` (optional, defaults to `3`; number of automatic mint retry attempts before marking a charge as `failed`)

Keep secrets out of git. Use platform secret managers.

## Webhook Operations
- Coinbase Commerce webhook endpoint: `POST /api/webhooks/coinbase`.
- Events handled: `charge:confirmed`, `charge:failed`, `charge:delayed`.
- Signature verification via `COINBASE_WEBHOOK_SECRET`.
- On `charge:confirmed`, service mints ticket NFT; mint failures increment `mintRetryCount` and set the charge status to `retrying` until `MINT_MAX_RETRIES` is exceeded, then `failed`.
- Recommended: Enable retry/alerting in Coinbase dashboard for failed deliveries and monitor on-call logs.
- Manual replay: after minting infra is restored, run `npx tsx scripts/retry-charges.ts` (or equivalent automation) to move charges stuck in `retrying` back to `pending` so they are reprocessed.

## Dev Mode (NEXT_PUBLIC_DEV_MODE=true)
- Mock charge creation with optional on-chain minting when mint env vars are present.
- Checkout stores charge status/token metadata in localStorage for the My Tickets page.
