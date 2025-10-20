# Database Optimization Guide

## Current Index Coverage

The database schema already has comprehensive indexing in place. Here's a summary of existing optimizations:

### ✅ Well-Indexed Tables

#### User Table
- `@@index([email])` - For login and user lookups
- `@@index([stripeCustomerId])` - For payment processing

#### Event Table
- `@@index([title])` - Text search
- `@@index([startsAt])` - Date ordering/filtering
- `@@index([status])` - Status filtering
- `@@index([venueId])` - Venue lookups
- `@@index([artistId])` - Artist lookups
- `@@index([startsAt, status])` - Active events (composite)
- `@@index([featured, startsAt])` - Featured events
- `@@index([featured, featuredUntil])` - Featured expiry
- `@@index([eventSource])` - Source filtering

#### Ticket Table
- `@@index([eventId])` - Event ticket lookups
- `@@index([userId])` - User ticket lookups
- `@@index([status])` - Status filtering
- `@@index([eventId, status])` - Event ticket status (composite)
- `@@index([ticketTypeId])` - Ticket type lookups
- Unique constraints on seat positions

#### Venue Table
- `@@index([name])` - Text search
- `@@index([city])` - Location filtering
- `@@index([state])` - State filtering
- `@@index([city, state])` - Location searches (composite)

#### Artist Table
- `@@index([name])` - Text search
- `@@index([genre])` - Genre filtering

#### Charge Table
- `@@index([chargeId])` - Charge lookups
- `@@index([userId])` - User charges
- `@@index([eventId])` - Event charges

#### EventImpression Table
- `@@index([eventId])` - Event impression tracking
- `@@index([sessionId])` - Session-based lookups
- `@@index([createdAt])` - Time-based queries

#### AdvocacyRequest Table
- `@@index([email])` - User advocacy lookups
- `@@index([eventId])` - Event advocacy tracking
- `@@index([emailSent])` - Email processing status
- `@@index([createdAt])` - Time-based queries

#### AdminAuditLog Table
- `@@index([userId, createdAt])` - User audit trail (composite)
- `@@index([action, createdAt])` - Action-based queries (composite)
- `@@index([targetType, targetId])` - Target lookups (composite)

## 🎯 Query Optimization Best Practices

### 1. Use Selective Queries
```typescript
// ✅ Good - Select only needed fields
const events = await prisma.event.findMany({
  select: {
    id: true,
    title: true,
    startsAt: true,
  },
});

// ❌ Bad - Loads all fields
const events = await prisma.event.findMany();
```

### 2. Use Batch Loading (findByIds)
```typescript
// ✅ Good - Single query with IN clause
const events = await prisma.event.findMany({
  where: { id: { in: eventIds } },
});

// ❌ Bad - N queries
const events = await Promise.all(
  eventIds.map(id => prisma.event.findUnique({ where: { id } }))
);
```

### 3. Use Aggregations for Counts
```typescript
// ✅ Good - SQL aggregation
const stats = await prisma.ticket.groupBy({
  by: ['status'],
  where: { eventId: 1 },
  _count: { id: true },
  _sum: { priceCents: true },
});

// ❌ Bad - Load all records
const tickets = await prisma.ticket.findMany({ where: { eventId: 1 } });
const count = tickets.length;
```

### 4. Use Composite Indexes for Multi-Column Queries
```typescript
// ✅ Optimized by [startsAt, status] composite index
const upcomingEvents = await prisma.event.findMany({
  where: {
    startsAt: { gte: new Date() },
    status: 'published',
  },
});
```

## 📊 Performance Monitoring

### Enable Query Logging (Development)
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### Monitor Slow Queries
```sql
-- PostgreSQL slow query log
-- Add to postgresql.conf:
log_min_duration_statement = 1000  -- Log queries > 1 second
```

## 🔧 Additional Optimizations

### Database Connection Pooling
Already configured via Prisma's default connection pool.

### Recommended PostgreSQL Settings
```sql
-- For production with moderate traffic
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1  -- For SSD
effective_io_concurrency = 200
work_mem = 4MB
```

## 🚀 Implemented Optimizations

### ✅ Completed
1. **VenueDashboardService** - Selective queries + SQL aggregations
2. **ValueTrackingService** - Prisma.aggregate instead of loading all records
3. **TicketService** - Batch loading with findByIds
4. **EventRepository** - Added findByIds method for batch queries
5. **Comprehensive indexes** - Already in schema for all frequently queried fields

### 📋 Future Considerations

1. **Caching Layer**
   - Redis for frequently accessed data (event listings, venue info)
   - Cache event details for 5-15 minutes
   - Invalidate on updates

2. **Read Replicas**
   - For high traffic, add read replicas for GET queries
   - Direct writes to primary, reads to replicas

3. **Materialized Views**
   - For complex reporting queries (venue marketing values)
   - Refresh periodically or on-demand

4. **Full-Text Search**
   - PostgreSQL's built-in full-text search for event/venue search
   - Or integrate Elasticsearch/Algolia for advanced search

## 📈 Expected Performance

With current optimizations:
- Event listings: < 100ms
- Dashboard loads: < 300ms
- Ticket validation: < 50ms per batch
- Advocacy tracking: < 100ms

## 🔍 Query Analysis Tools

```bash
# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "Event"
WHERE "startsAt" > NOW() AND "status" = 'published'
ORDER BY "startsAt" ASC;

# Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## 💡 Tips

1. Always use indexes when filtering or joining
2. Limit result sets with pagination
3. Use select to specify needed fields
4. Batch operations when possible
5. Monitor query performance in production
6. Use transactions for related operations
7. Leverage existing composite indexes

---

**Note**: The database is already well-optimized with comprehensive indexing. Focus on query patterns (selective queries, batch loading, aggregations) rather than adding more indexes.
