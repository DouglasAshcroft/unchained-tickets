# Unchained Tickets - Startup Guide

Quick reference for starting the development environment and recovering from common issues.

## Prerequisites

- Docker (for PostgreSQL database)
- Node.js 18+ and npm
- Port 3000 available (Next.js dev server)
- Port 5433 available (PostgreSQL database)

## Quick Start

### 1. Start the Database

```bash
npm run start:db
```

This starts the PostgreSQL container on port 5433.

### 2. Start the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 3. Verify Everything is Running

```bash
curl http://localhost:3000/api/health | jq
```

Expected output:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## One-Command Clean Start

If you want to start fresh (kills all processes, starts database, starts dev server):

```bash
npm run dev:clean
```

## Troubleshooting

### Issue: Port 3000 Already in Use

**Symptoms:**
```
⚠ Port 3000 is in use by an unknown process, using available port 3001 instead.
```

**Fix:**
```bash
# Kill all Node.js processes
pkill -f "next"

# Or use the cleanup script
npm run stop:all

# Then restart
npm run dev
```

### Issue: Database Not Connected

**Symptoms:**
```json
{
  "status": "error",
  "database": "disconnected"
}
```

**Fix:**
```bash
# Check if database container is running
docker ps | grep unchained-db

# If not running, start it
docker start unchained-db

# Wait 2-3 seconds for database to be ready
sleep 3

# Restart the dev server to pick up the connection
npm run dev
```

### Issue: Multiple Zombie Processes

**Symptoms:**
- Dev server starts on port 3001, 3002, 3003, etc.
- Database health check fails randomly
- Old backend servers still running

**Fix:**
```bash
# Run the cleanup script
npm run stop:all

# Verify all processes are killed
lsof -ti:3000 -ti:3001 -ti:3101

# Start fresh
npm run dev:clean
```

### Issue: Next.js Workspace Warning

**Symptoms:**
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
```

**Fix:**
This is handled in `next.config.ts` with `outputFileTracingRoot`. The warning should be minimal and won't affect functionality.

### Issue: Claude IDE Recovery After Restart

**Symptoms:**
- Multiple background processes from previous session
- Database stopped
- Port conflicts

**Fix:**
Use the Claude recovery script:
```bash
bash .claude/startup-recovery.sh
```

Or manually:
```bash
# 1. Kill all zombie processes
pkill -f "next"
pkill -f "node.*server.js"

# 2. Start database
docker start unchained-db
sleep 3

# 3. Start dev server
cd /home/dougjackson/Projects/unchained-tickets
npm run dev
```

## Docker Database Management

### Start Database
```bash
docker start unchained-db
```

### Stop Database
```bash
docker stop unchained-db
```

### View Database Logs
```bash
docker logs unchained-db
```

### Access Database Shell
```bash
docker exec -it unchained-db psql -U unchained -d unchained
```

## Health Checks

### Check Next.js Server
```bash
curl http://localhost:3000
```

### Check API Health Endpoint
```bash
curl http://localhost:3000/api/health | jq
```

### Check Database Directly
```bash
docker exec unchained-db pg_isready -U unchained
```

## Common npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run dev:clean` | Stop all processes and start fresh |
| `npm run start:db` | Start PostgreSQL container |
| `npm run stop:all` | Kill all development processes |
| `npm run build` | Build production bundle |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run prisma:migrate` | Run database migrations |

## Environment Variables

Key environment variables in `.env`:

- `DATABASE_URL` - PostgreSQL connection string (port 5433)
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - OnchainKit API key
- `NEXT_PUBLIC_CHAIN_ID` - Base blockchain (8453)
- `JWT_SECRET` - Authentication secret
- `NEXT_PUBLIC_API_BASE_URL` - API base URL (http://localhost:3000)

## Project Structure

```
unchained-tickets/
├── app/              # Next.js 15 App Router pages
├── components/       # React components
│   ├── layout/      # Navbar, Footer
│   └── ui/          # Button, Card, etc.
├── lib/             # Utilities, hooks, repositories
├── prisma/          # Database schema and migrations
├── public/          # Static assets
└── .env             # Environment variables (not in git)
```

## Migration Status

**Current Phase:** Phase 3 - Frontend Component Migration

**Completed:**
- ✅ Phase 1: Project Setup & Infrastructure
- ✅ Phase 2: Core Features (Auth, Database, API)

**In Progress:**
- 🔄 Phase 3: UI Components with Unchained branding
  - ✅ Button component
  - ✅ Card component
  - 🔄 Homepage styling
  - ⏳ Event pages
  - ⏳ Checkout with OnchainKit

## Support

If you encounter issues not covered here:

1. Check the Claude conversation history
2. Review the logs: `/tmp/next-dev.log`
3. Check Docker logs: `docker logs unchained-db`
4. Verify environment variables in `.env`
