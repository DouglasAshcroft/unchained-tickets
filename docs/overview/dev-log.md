# Unchained Tickets – Dev Log

This document captures ongoing engineering work so contributors can quickly understand recent changes and upcoming tasks. Keep entries concise and reverse-chronological.

## WSL port forwarding helper
- `npm run dev` automatically runs `setup:portproxy`, mapping Windows `localhost:3000` to the active WSL IP so Chrome on Windows hits the dev server directly.
- If the setup script warns about permissions, rerun the printed `netsh` command from an elevated Windows PowerShell.
- When you no longer need the mapping, run `npm run teardown:portproxy` (or execute the matching `netsh ... delete` command in an elevated shell).


## 2025-10-05
- **Metadata API fixed:** Switched `artistEvents` usage to the new `artists` join, preventing Prisma errors when NFT metadata is requested (`app/api/metadata/[tokenId]/route.ts`).
- **Venue filtering hardened:** Removed references to the legacy `location` column and now search city, state, or `addressLine1`; cards detail pages derive sensible location fallbacks (`lib/repositories/VenueRepository.ts`, `app/venues/page.tsx`, `components/VenueCard.tsx`, `app/venues/[slug]/page.tsx`).
- **Event payload enriched:** API now returns `supportingArtists`, ticket counts, and availability so the front end can display accurate status badges (`lib/services/EventService.ts`, `app/events/page.tsx`).
- **Dev-mode minting safeguards:** Checkout gracefully skips on-chain minting when RPC/private key/contract env vars are absent, acknowledging both legacy and new env names (`app/api/checkout/create-charge/route.ts`, `lib/services/NFTMintingService.ts`).
- **ERC-1155 token flow rebuilt:** Ticket contract now tracks per-event supply with `eventActiveSupply`, maps token IDs back to events, and requires callers to reference token IDs when checking-in (`contracts/UnchainedTickets.sol`). TypeScript wrapper updated accordingly and dev checkout warns when minting credentials are missing (`lib/services/NFTMintingService.ts`, `components/CheckoutModal.tsx`).
- **Regression coverage:** Added unit and integration tests for charge creation and Coinbase webhooks (dev/prod happy paths, mint failures, signature checks) in addition to `eventService` coverage (`__tests__/unit/chargeHandler.test.ts`, `__tests__/integration/webhookCoinbase.test.ts`). `npx hardhat compile` passes; Vitest currently fails in the sandbox with `ERR_IPC_CHANNEL_CLOSED` when spawning worker processes.
- **Coinbase Commerce integration:** Added persistent `Charge` model, REST integration for charge creation, and webhook processing that mints NFTs on `charge:confirmed` events with signature verification (`prisma/schema.prisma`, `lib/services/CoinbaseCommerceService.ts`, `app/api/checkout/create-charge/route.ts`, `app/api/webhooks/coinbase/route.ts`). Frontend dev checkout now stores charge status/token metadata (`components/CheckoutModal.tsx`).
- **Dev checkout resiliency:** API now returns `mint-failed` status (HTTP 200) when testnet minting fails so the UI, which now surfaces toast notifications, can react without surfacing a hard error (`app/api/checkout/create-charge/route.ts`, `components/CheckoutModal.tsx`). Charge records track `mintRetryCount`/`mintLastError` and auto-transition to `retrying` until `MINT_MAX_RETRIES` is exceeded, after which they are marked `failed`.
- **Operational docs:** Added deployment checklists ([deployment-checklist](../operations/deployment-checklist.md)), production deployment guide ([production-deployment-guide](../operations/production-deployment-guide.md)), mainnet deployment notes ([mainnet-deployment](../operations/mainnet-deployment.md)), monitoring plan ([monitoring-setup](../operations/monitoring-setup.md)), plus the private runbook summary ([runbook-overview](../internal/security/runbook-overview.md)). Review these before launch.

### Follow-up work
- Investigate Vitest runner compatibility with the current sandbox (tinypool IPC errors) or provide `--pool` configuration.
- Extend ops playbook (and automation) for replaying charges stuck in `retrying` once minting infrastructure is stable.
