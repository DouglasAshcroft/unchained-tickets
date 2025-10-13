# Docker Setup Guide for Unchained Tickets

This guide explains how to use Docker Compose for managing your PostgreSQL database in development.

## Why Docker Compose?

✅ **Clean slate every time** - Easily wipe and rebuild without manual commands
✅ **No migration conflicts** - Fresh database in seconds
✅ **Consistent environment** - Same PostgreSQL version across all machines
✅ **Version controlled** - Infrastructure as code
✅ **One-command operations** - Simple npm scripts handle everything

---

## Quick Start (First Time Setup)

### 1. Stop Any Existing PostgreSQL Container

```bash
docker stop unchained-db 2>/dev/null || true
docker rm unchained-db 2>/dev/null || true
```

### 2. Start Fresh with Docker Compose

```bash
npm run docker:fresh
```

This command will:
- Stop and remove any existing `unchained-db` container
- Start a fresh PostgreSQL 15 container with Docker Compose
- Wait for the database to be ready
- Apply all migrations
- Seed with enriched demo data

### 3. Start the Development Server

```bash
npm run dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000) with:
- 50 smartly distributed events
- Genre-specific poster images
- Real venue exterior photos
- Venue onboarding checklists with varied completion
- Advocacy test data with impressions and waitlist

---

## Available Docker Commands

### `npm run docker:up`
Start the PostgreSQL container in the background.

```bash
npm run docker:up
```

### `npm run docker:down`
Stop the PostgreSQL container (keeps data).

```bash
npm run docker:down
```

### `npm run docker:down:volumes`
Stop the PostgreSQL container and **delete all data**.

```bash
npm run docker:down:volumes
```

### `npm run docker:logs`
View PostgreSQL container logs in real-time (Ctrl+C to exit).

```bash
npm run docker:logs
```

### `npm run docker:reset`
**Full reset** - Stop container, delete all data, restart, apply migrations, seed data.

```bash
npm run docker:reset
```

This is your **go-to command** for:
- Fixing corrupted database state
- Testing with fresh seed data
- Resolving migration conflicts
- Starting a demo with clean data

### `npm run docker:fresh`
Same as `docker:reset` but also removes any standalone `unchained-db` container first.

```bash
npm run docker:fresh
```

---

## Daily Development Workflow

### Starting Your Day

```bash
# Option 1: Container already exists
npm run docker:up
npm run dev

# Option 2: Fresh start
npm run docker:reset
npm run dev
```

### Making Schema Changes

1. Update `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Prisma will automatically apply the migration and regenerate the client

### Resetting with New Seed Data

```bash
npm run docker:reset
```

---

## Troubleshooting

### Problem: Port 5433 already in use

**Solution:** Stop any existing PostgreSQL processes:

```bash
# Stop Docker container
docker stop unchained-db

# OR stop system PostgreSQL service
sudo systemctl stop postgresql
```

### Problem: Migration failed to apply

**Solution:** Full reset with clean migrations:

```bash
npm run docker:reset
```

### Problem: "Database does not exist"

**Solution:** The database might not be initialized yet:

```bash
docker-compose down -v
docker-compose up -d
sleep 5  # Wait for PostgreSQL to initialize
npx prisma migrate deploy
npm run db:seed
```

### Problem: citext extension error

**Solution:** The `init.sql` script should handle this automatically. If it doesn't:

```bash
docker exec -it unchained-db psql -U unchained -d unchained -c "CREATE EXTENSION IF NOT EXISTS citext;"
```

### Problem: Old container conflicts with Docker Compose

**Solution:** Use the `docker:fresh` command:

```bash
npm run docker:fresh
```

---

## Database Access

### Using Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### Using psql Command Line

```bash
docker exec -it unchained-db psql -U unchained -d unchained
```

Common psql commands:
- `\dt` - List all tables
- `\d table_name` - Describe table schema
- `\q` - Quit psql

### Using PgAdmin (Optional)

Uncomment the `pgadmin` service in `docker-compose.yml`, then:

```bash
docker-compose up -d
```

Access at [http://localhost:5050](http://localhost:5050)
- **Email:** admin@unchained.xyz
- **Password:** unchained

---

## Docker Compose Configuration

### Services Included

**postgres** (Port 5433)
- PostgreSQL 15 Alpine
- Persistent volume: `postgres_data`
- Auto-initialization with `citext` extension
- Health checks enabled

**pgadmin** (Port 5050) - *Optional, commented out by default*
- Web-based database management
- Pre-configured server connection

### Environment Variables

All configured in `.env`:
```
DATABASE_URL="postgresql://unchained:unchained@localhost:5433/unchained?schema=public"
ADMIN_PASSWORD='unch@inedTicket$'
```

### Volume Management

Data is persisted in Docker volume `postgres_data`:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect unchained-tickets_postgres_data

# Delete volume (⚠️ deletes all data)
docker volume rm unchained-tickets_postgres_data
```

---

## Production Considerations

This Docker Compose setup is for **development only**. For production:

1. Use managed database services (Supabase, Neon, AWS RDS)
2. Enable SSL connections
3. Use strong passwords (not hardcoded)
4. Enable automated backups
5. Configure proper resource limits
6. Use secrets management

---

## Useful Commands Cheat Sheet

| Task | Command |
|------|---------|
| Fresh start | `npm run docker:fresh` |
| Start database | `npm run docker:up` |
| Stop database | `npm run docker:down` |
| Reset with new data | `npm run docker:reset` |
| View logs | `npm run docker:logs` |
| Database shell | `docker exec -it unchained-db psql -U unchained -d unchained` |
| Database browser | `npm run prisma:studio` |
| Apply migrations | `npx prisma migrate deploy` |
| Create migration | `npx prisma migrate dev --name migration_name` |
| Seed database | `npm run db:seed` |

---

## Need Help?

- **Prisma Docs:** https://www.prisma.io/docs
- **Docker Compose Docs:** https://docs.docker.com/compose/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

For project-specific issues, check:
- [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)
- [SETUP_GUIDE.md](./SETUP_GUIDE.md)
