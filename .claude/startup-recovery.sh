#!/bin/bash
# Claude IDE Startup Recovery Script
# Cleans up zombie processes and starts the development environment fresh

set -e  # Exit on error

echo "🔧 Claude IDE Startup Recovery"
echo "=============================="
echo ""

# Change to project directory
cd /home/dougjackson/Projects/unchained-tickets

echo "Step 1: Killing zombie processes..."
echo "-----------------------------------"

# Kill all Next.js processes
pkill -f "next" 2>/dev/null && echo "✓ Killed Next.js processes" || echo "  (no Next.js processes found)"

# Kill old backend server processes from Unchained/backend/server
pkill -f "node.*server.js" 2>/dev/null && echo "✓ Killed old backend server processes" || echo "  (no old backend processes found)"

# Wait a moment for processes to terminate
sleep 2

echo ""
echo "Step 2: Checking for port conflicts..."
echo "---------------------------------------"

# Check if port 3000 is still in use
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "⚠ Port 3000 still in use, force killing..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

echo "✓ Port 3000 is free"

echo ""
echo "Step 3: Starting PostgreSQL database..."
echo "----------------------------------------"

# Start the database container
if docker ps | grep -q unchained-db; then
  echo "✓ Database already running"
else
  docker start unchained-db > /dev/null 2>&1 && echo "✓ Database started" || {
    echo "✗ Failed to start database"
    echo "  Run: docker ps -a | grep postgres"
    exit 1
  }
fi

# Wait for database to be ready
echo "  Waiting for database to be ready..."
sleep 3

# Verify database is healthy
if docker ps | grep -q "unchained-db.*healthy"; then
  echo "✓ Database is healthy"
else
  echo "⚠ Database is starting up (may take a few more seconds)"
fi

echo ""
echo "Step 4: Verifying environment..."
echo "---------------------------------"

# Check .env file exists
if [ -f .env ]; then
  echo "✓ .env file found"

  # Check critical env vars
  if grep -q "DATABASE_URL.*5433" .env; then
    echo "✓ DATABASE_URL configured (port 5433)"
  else
    echo "⚠ DATABASE_URL may be misconfigured"
  fi

  if grep -q "NEXT_PUBLIC_ONCHAINKIT_API_KEY" .env; then
    echo "✓ OnchainKit API key configured"
  else
    echo "⚠ OnchainKit API key missing"
  fi
else
  echo "✗ .env file not found!"
  exit 1
fi

echo ""
echo "Step 5: Starting development server..."
echo "---------------------------------------"

echo "✓ Running: npm run dev"
echo ""
echo "Server will be available at: http://localhost:3000"
echo "Health check: curl http://localhost:3000/api/health | jq"
echo ""

# Start the dev server (not in background, so user can see output)
exec npm run dev
