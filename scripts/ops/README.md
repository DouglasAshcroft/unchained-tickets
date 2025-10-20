# Operations Scripts

Utility scripts for day-to-day maintenance and local developer workflows.

- `add-contract-to-db.ts` – Insert deployed contract metadata into the database.
- `retry-charges.ts` – Reprocess failed Coinbase Commerce charges.
- `seed-artists.ts` – Populate seed data for local development.
- `transform-souvenirs.ts` – Batch process souvenir transformations.
- `lighthouse-summary.sh` – Summarize Lighthouse results.
- `setup-port-proxy.cjs` / `teardown-port-proxy.cjs` – Configure Windows↔WSL port forwarding.

Invoke TypeScript scripts with `npx tsx <script>` and shell scripts with `bash <script>`.
