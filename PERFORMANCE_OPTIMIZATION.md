# Performance Optimization Guide

Complete guide for optimizing Unchained Tickets for speed and efficiency.

## Overview

**Time**: 2-3 hours
**Goal**: Achieve Lighthouse scores > 90 across all metrics
**Impact**: Faster load times = Better UX = More conversions

---

## Current Performance Baseline

### Run Initial Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://YOUR_DOMAIN \
  --output=html \
  --output=json \
  --output-path=./lighthouse-baseline \
  --view
```

**Document baseline scores:**
- Performance: ___
- Accessibility: ___
- Best Practices: ___
- SEO: ___

---

## 1. Image Optimization (30 min)

### 1.1 Audit Images

Check current images:
- Event posters
- Artist photos
- Venue images
- Logos

**Issues to fix:**
- Large file sizes (> 500KB)
- Wrong formats (PNG instead of WebP)
- Missing dimensions
- No lazy loading

### 1.2 Optimize Images

**Use Next.js Image Component**

Already implemented in [next.config.ts](next.config.ts):

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
    },
  ],
}
```

**Update components to use Next Image:**

```typescript
// Before (slow)
<img src={event.posterImageUrl} alt={event.title} />

// After (optimized)
import Image from 'next/image';

<Image
  src={event.posterImageUrl}
  alt={event.title}
  width={400}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Optional
/>
```

### 1.3 Image CDN (Optional)

Consider using Cloudinary or similar:

```typescript
const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  return `https://res.cloudinary.com/your-cloud/${src}?w=${width}&q=${quality || 75}`;
};

<Image
  loader={imageLoader}
  src="event-poster.jpg"
  alt="Event"
  width={400}
  height={600}
/>
```

**Savings**: 50-70% file size reduction

---

## 2. Code Splitting & Lazy Loading (45 min)

### 2.1 Dynamic Imports

Lazy load heavy components:

**Before:**
```typescript
import { QRCode } from '@/components/ui/QRCode';
```

**After:**
```typescript
import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('@/components/ui/QRCode'), {
  loading: () => <div>Loading QR code...</div>,
  ssr: false, // Don't render on server
});
```

### 2.2 Conditional Loading

Load wallet libraries only when needed:

```typescript
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const WalletConnect = dynamic(() => import('@/components/WalletConnect'), {
  ssr: false,
});

export function Navbar() {
  const [showWallet, setShowWallet] = useState(false);

  return (
    <>
      <button onClick={() => setShowWallet(true)}>
        Connect Wallet
      </button>
      {showWallet && <WalletConnect />}
    </>
  );
}
```

### 2.3 Route-Based Splitting

Next.js already does this, but verify:

```bash
npm run build

# Check bundle sizes in output
# Look for pages > 200KB
```

**Large bundles to investigate:**
- `/events` page
- `/my-tickets` page
- Any page with heavy libraries

---

## 3. Database Query Optimization (30 min)

### 3.1 Add Indexes

Update `prisma/schema.prisma`:

```prisma
model Event {
  // ... existing fields

  @@index([status, startsAt])
  @@index([venueId])
  @@index([status, endsAt])
}

model Ticket {
  // ... existing fields

  @@index([userId, status])
  @@index([eventId, status])
  @@index([qrCode])
}

model Charge {
  // ... existing fields

  @@index([walletAddress])
  @@index([status, createdAt])
  @@index([mintedTokenId])
}
```

**Apply indexes:**
```bash
npx prisma migrate dev --name add_performance_indexes
```

### 3.2 Optimize Queries

**Before (slow):**
```typescript
const events = await prisma.event.findMany({
  include: {
    venue: true,
    artists: {
      include: {
        artist: true,
      },
    },
    ticketTypes: true,
    _count: {
      select: { tickets: true },
    },
  },
});
```

**After (fast):**
```typescript
const events = await prisma.event.findMany({
  where: { status: 'published' },
  select: {
    id: true,
    title: true,
    startsAt: true,
    posterImageUrl: true,
    venue: {
      select: {
        name: true,
        city: true,
        state: true,
      },
    },
  },
  take: 20, // Pagination
  orderBy: { startsAt: 'asc' },
});
```

**Key changes:**
- Use `select` instead of `include` (only fetch needed fields)
- Add `where` filter
- Add `take` for pagination
- Order results

### 3.3 Enable Query Logging

Temporarily enable to find slow queries:

```typescript
// lib/db/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

Look for queries > 100ms.

---

## 4. API Response Caching (30 min)

### 4.1 Metadata API Caching

Already implemented in [app/api/metadata/[tokenId]/route.ts](app/api/metadata/[tokenId]/route.ts):

```typescript
return NextResponse.json(metadata, {
  headers: {
    'Cache-Control': 'public, max-age=3600', // 1 hour
  },
});
```

### 4.2 Events API Caching

Add caching to events API:

```typescript
// app/api/events/route.ts
export async function GET() {
  const events = await fetchEvents();

  return NextResponse.json(events, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

**Cache strategy:**
- `s-maxage=300`: CDN caches for 5 minutes
- `stale-while-revalidate=600`: Serve stale for 10 min while revalidating

### 4.3 React Query for Client Caching

Already configured with `@tanstack/react-query`:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function EventsList() {
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return <>{/* render events */}</>;
}
```

---

## 5. Bundle Size Optimization (20 min)

### 5.1 Analyze Bundle

```bash
# Build and analyze
npm run build

# Output shows page sizes
# Look for:
# - Pages > 500KB
# - Shared chunks > 200KB
```

### 5.2 Package Optimization

Already configured in [next.config.ts](next.config.ts):

```typescript
experimental: {
  optimizePackageImports: [
    '@coinbase/onchainkit',
    '@tanstack/react-query',
    'date-fns',
    'wagmi',
    'viem',
  ],
},
```

### 5.3 Remove Unused Dependencies

Check for unused packages:

```bash
npm install -g depcheck
depcheck

# Remove any unused packages
npm uninstall <package>
```

### 5.4 Tree Shaking

Verify imports use named exports:

```typescript
// Good (tree-shakeable)
import { formatDistance } from 'date-fns';

// Bad (imports everything)
import * as dateFns from 'date-fns';
```

---

## 6. Server-Side Optimizations (15 min)

### 6.1 Enable Compression

Vercel enables this by default, but verify:

```typescript
// next.config.ts
const nextConfig = {
  compress: true, // Gzip compression
};
```

### 6.2 Remove Console Logs

Already configured in [next.config.ts](next.config.ts):

```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
},
```

### 6.3 Edge Functions (Advanced)

For high-traffic APIs, consider Edge:

```typescript
// app/api/events/route.ts
export const runtime = 'edge'; // Run on edge network

export async function GET() {
  // ... handler
}
```

**Benefits:**
- Lower latency (closer to users)
- Better scalability
- Lower costs

---

## 7. Frontend Performance (30 min)

### 7.1 Debounce Search Input

```typescript
import { useDebouncedValue } from 'use-debounce';

export function EventSearch() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);

  // Use debouncedSearch for API calls
  useEffect(() => {
    fetchEvents(debouncedSearch);
  }, [debouncedSearch]);
}
```

### 7.2 Virtualize Long Lists

For events list with > 100 items:

```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

export function EventsList({ events }: { events: Event[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={events.length}
      itemSize={200}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <EventCard event={events[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 7.3 Optimize Re-renders

Use React memo for expensive components:

```typescript
import { memo } from 'react';

export const EventCard = memo(function EventCard({ event }: { event: Event }) {
  return <>{/* render */}</>;
});
```

### 7.4 Intersection Observer

Lazy load images when visible:

```typescript
import { useInView } from 'react-intersection-observer';

export function EventCard({ event }: { event: Event }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView && (
        <Image src={event.posterImageUrl} alt={event.title} />
      )}
    </div>
  );
}
```

---

## 8. Third-Party Script Optimization (10 min)

### 8.1 Load Scripts Efficiently

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}

        {/* Load analytics after page interactive */}
        <Script
          src="https://analytics.example.com/script.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

**Strategies:**
- `beforeInteractive`: Critical scripts
- `afterInteractive`: Non-critical (default)
- `lazyOnload`: Defer until idle

### 8.2 Self-Host Google Fonts (Optional)

Instead of loading from Google:

```bash
npm install @fontsource/inter
```

```typescript
// app/layout.tsx
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
```

---

## 9. Monitoring Performance

### 9.1 Real User Monitoring

Add to Sentry config:

```typescript
Sentry.init({
  // ... existing config
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', /^\//],
    }),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
});
```

### 9.2 Web Vitals

Track Core Web Vitals:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 9.3 Custom Performance Tracking

```typescript
// lib/monitoring/performance.ts
export function trackPageLoad() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

      console.log('Page load time:', pageLoadTime);
      // Send to analytics
    });
  }
}
```

---

## 10. Database Connection Pooling

### 10.1 Configure Prisma

Update `lib/db/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 10.2 Connection Limits

For Vercel Postgres:

```env
# Use pooled connection
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10"
```

---

## Performance Checklist

### Images
- [ ] All images use Next.js Image component
- [ ] Lazy loading enabled
- [ ] WebP format where possible
- [ ] Dimensions specified

### Code
- [ ] Heavy components lazy loaded
- [ ] Bundle size < 500KB per page
- [ ] No unused dependencies
- [ ] Console logs removed in production

### Database
- [ ] Indexes added to frequently queried fields
- [ ] Queries use `select` instead of `include`
- [ ] Pagination implemented
- [ ] Connection pooling enabled

### APIs
- [ ] Response caching enabled
- [ ] Cache headers configured
- [ ] Compression enabled

### Frontend
- [ ] Search inputs debounced
- [ ] Long lists virtualized
- [ ] Expensive components memoized
- [ ] Images lazy loaded

### Monitoring
- [ ] Lighthouse audit run
- [ ] Performance monitoring enabled
- [ ] Web Vitals tracked
- [ ] Real user metrics collected

---

## Target Metrics

### Lighthouse Scores
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Custom Metrics
- Homepage load: < 2s
- Events page load: < 3s
- API response time: < 500ms
- Database query time: < 100ms

---

## Optimization Results Template

Document improvements:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Performance Score | 72 | 94 | +22 points |
| LCP | 4.2s | 1.8s | -2.4s |
| Bundle Size | 842KB | 412KB | -51% |
| API Response | 850ms | 320ms | -62% |

---

## Performance Optimization Complete! 🚀

After optimizations:
1. ✅ Run final Lighthouse audit
2. ✅ Compare before/after metrics
3. ✅ Document improvements
4. ✅ Monitor in production

**Remember**: Performance is ongoing. Monitor and optimize regularly!
