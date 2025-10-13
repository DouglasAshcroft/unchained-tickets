-- PostgreSQL initialization script for Unchained Tickets
-- This runs automatically when the container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For text search performance

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Unchained Tickets database initialized successfully';
END $$;
