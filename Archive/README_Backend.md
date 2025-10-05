# Unchained – Database Guide

A concise, living guide for working with the Unchained PostgreSQL database: schema, migrations, seeds, and operations.

> TL;DR: **Raw PostgreSQL DDL** is our source of truth. We apply it with **node-pg-migrate** in CI/CD. Seeds are idempotent.

---

## Table of Contents

- [Philosophy](#philosophy)
- [Schema](#schema)
- [Local Setup](#local-setup)
- [Migrations](#migrations)
- [Seeds](#seeds)
- [Zero-Downtime Rules](#zero-downtime-rules)
- [Environments & CI/CD](#environments--cicd)
- [Operational Playbooks](#operational-playbooks)
- [FAQ](#faq)

---

## Philosophy

- **Raw SQL first**: We write schema changes in PostgreSQL DDL to leverage enums, citext, indexes, etc.
- **One authoritative history**: Each change is a migration, committed and applied in order.
- **Safe by default**: Additive first, backfill in batches, then tighten constraints.
- **Idempotent seeds**: Can be run many times without breaking state.

---

## Schema

- Canonical DDL lives at: `db/sql/2025_08_15_initial_schema.sql` (auth, RBAC, wallets, payments, tickets, waitlist, analytics).
- Enums:
  - `user_role`: `('fan','artist','venue','admin')`
  - `ticket_status`: `('reserved','minted','transferred','refunded','canceled','used','revoked')`
  - `payment_status`: `('initiated','authorized','settled','failed','refunded','canceled')`
  - `payment_method`: `('fiat_stripe','usdc_onchain','eth_onchain','promo')`
  - `event_status`: `('draft','published','canceled','completed')`
  - `scan_result`: `('valid','duplicate','revoked','expired','unknown')`
- Extensions:
  - `citext` for case-insensitive email uniqueness

> Pro tip: prefer `timestamptz` (TIMESTAMPTZ) for all timestamps.

---

## Local Setup

**1) Environment**

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/unchained_dev
```

**2) Install tooling**

```bash
npm i -D node-pg-migrate pg cross-env
```

**3) Create DB (if needed)**

```bash
createdb unchained_dev
```

**4) Run migrations + seeds**

```bash
npm run db:migrate
npm run db:seed
```

Directory layout:

```
db/
  migrations/
    2025_08_15_001_init.js
  sql/
    2025_08_15_initial_schema.sql
  seeds/
    seed_base.sql
```

---

## Migrations

We use **node-pg-migrate** to apply migrations in order and track them in a schema table.

**Scripts (package.json)**

```json
{
  "scripts": {
    "db:migrate": "cross-env DATABASE_URL=$DATABASE_URL node-pg-migrate -m db/migrations",
    "db:migrate:undo": "cross-env DATABASE_URL=$DATABASE_URL node-pg-migrate -m db/migrations -r",
    "db:seed": "cross-env DATABASE_URL=$DATABASE_URL psql \"$DATABASE_URL\" -f db/seeds/seed_base.sql"
  }
}
```

**Initial migration (raw SQL)**
`db/migrations/2025_08_15_001_init.js` runs the DDL in `db/sql/2025_08_15_initial_schema.sql`.

**Creating a new migration**

```bash
# JS migration (for concurrent indexes or data backfills)
npx node-pg-migrate -m db/migrations -n 2025_09_01_add_idx_tickets
# then edit the generated file
```

**Example: run an index CONCURRENTLY (outside a transaction)**

```js
// db/migrations/2025_09_01_001_add_idx_concurrently.js
exports.up = async (pgm) => {
  await pgm.run(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_user_status ON tickets(user_id, status);`,
    {
      singleTransaction: false,
    }
  );
};
exports.down = async (pgm) => {
  await pgm.run(`DROP INDEX CONCURRENTLY IF EXISTS idx_tickets_user_status;`, {
    singleTransaction: false,
  });
};
```

**Rollbacks**

- Prefer forward-only migrations in prod. Use `db:migrate:undo` only in dev/staging.
- For ENUMs, never “remove” a value; add new values with `ALTER TYPE ... ADD VALUE IF NOT EXISTS`.

---

## Seeds

**Idempotent base seed**: `db/seeds/seed_base.sql`

- Roles: `fan, artist, venue, admin`
- Permissions: `event.read, event.write, ticket.scan, payout.manage`
- Maps `admin` → all permissions
- Optional founder user (`founder@unchained.xyz`)

Run:

```bash
npm run db:seed
```

---

## Zero-Downtime Rules

1. **Additive first**: add nullable columns/tables → deploy app → backfill → add NOT NULL/constraints later.
2. **Enums**: use `ALTER TYPE ... ADD VALUE IF NOT EXISTS`; never delete values in-place.
3. **Indexes**: use `CREATE INDEX CONCURRENTLY` in a separate JS migration with `singleTransaction: false`.
4. **Backfills**: run in batches; make scripts idempotent (safe to re-run).
5. **Deletes**: remove columns/tables only after the app no longer references them for at least one release.
6. **Backups**: take a snapshot before prod migrations; enable PITR on the prod instance.

---

## Environments & CI/CD

We deploy migrations via **GitHub Actions**:

- **Staging**: on every push to `main`
- **Production**: on **published releases** (tagged), protected by environment approval

Workflow file: `.github/workflows/db-migrations.yml`

**Required GitHub environment secrets**

- `STAGING_DATABASE_URL`
- `PROD_DATABASE_URL`

**Local vs CI invariants**

- Migrations must be deterministic and idempotent.
- Seeds must be idempotent and safe to rerun.

---

## Operational Playbooks

**Create admin user (manual)**

```sql
INSERT INTO users (email, role, name) VALUES ('admin@unchained.xyz','admin','Admin')
ON CONFLICT (email) DO NOTHING;
```

**Backfill scanned_at from ticket_scans**

```sql
WITH latest_scan AS (
  SELECT ticket_id, MAX(scanned_at) AS last_scan
  FROM ticket_scans
  GROUP BY ticket_id
)
UPDATE tickets t
SET scanned_at = ls.last_scan
FROM latest_scan ls
WHERE t.id = ls.ticket_id
  AND (t.scanned_at IS NULL OR t.scanned_at < ls.last_scan);
```

**Add enum value safely**

```sql
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'revoked';
```

**Case-insensitive email fix (if missing)**

```sql
CREATE EXTENSION IF NOT EXISTS citext;
ALTER TABLE users ALTER COLUMN email TYPE citext;
```

---

## FAQ

**Q: Why not let Prisma manage migrations?**  
A: We use advanced Postgres features (enums, citext, concurrent indexes). Raw SQL avoids abstraction mismatch. If we add Prisma later, we’ll use `prisma db pull` to generate a type-safe client without changing migration ownership.

**Q: How do I add a wallet login (SIWE)?**  
A: Use `siwe_nonces` to issue/verify nonces. On success, upsert `wallets`, link via `user_wallets`, then create a `sessions` row.

**Q: How do we reward waitlist signups?**  
A: Link `waitlist_signups.user_id` on registration. When a primary wallet exists, mint OG NFT, insert into `nft_mints`, set `reward_token_id`/`reward_minted_at` on waitlist row.

**Q: Can I run migrations locally against Docker?**  
A: Yes. Point `DATABASE_URL` to your container (`postgres://postgres:postgres@localhost:5432/unchained_dev`) and run `npm run db:migrate`.

---

_This document is living—update it with each migration PR. Include rationale, impact, and rollback strategy._
