# Monitoring Setup Guide - Sentry Integration

Complete guide for setting up error tracking and performance monitoring with Sentry.

## Overview

**Time**: 1 hour
**Tools**: Sentry, Vercel Integration
**Benefits**:
- Real-time error tracking
- Performance monitoring
- Alert notifications
- Source map support

---

## Step 1: Create Sentry Account (10 min)

### 1.1 Sign Up

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up with GitHub (recommended) or email
3. Choose plan: **Developer (Free)** - Includes:
   - 5,000 errors/month
   - 10,000 performance transactions/month
   - 1 GB attachments
   - Sufficient for MVP launch

### 1.2 Create Organization

- Organization name: `your-company`
- Choose platform: **Next.js**
- Project name: `unchained-tickets`

---

## Step 2: Install Sentry (10 min)

### 2.1 Install Dependencies

```bash
npm install @sentry/nextjs
```

### 2.2 Run Sentry Wizard

```bash
npx @sentry/wizard@latest -i nextjs
```

**Wizard will prompt:**
1. **Login to Sentry?** Yes
2. **Select organization:** Choose yours
3. **Select project:** unchained-tickets
4. **Do you want to create sample errors?** No (we'll do this later)

**Wizard creates:**
- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration
- `instrumentation.ts` - Instrumentation setup
- Updates `next.config.ts` with Sentry plugin

### 2.3 Verify Installation

Check that these files were created:

```bash
ls -la | grep sentry
# Should show:
# sentry.client.config.ts
# sentry.server.config.ts
# sentry.edge.config.ts
```

---

## Step 3: Configure Sentry (15 min)

### 3.1 Update Sentry Client Config

Edit `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // 100% during development

  // Adjust this value in production, or use tracesSampler for finer control
  // tracesSampleRate: 0.1, // 10% in production to reduce costs

  // Session Replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of errors
  replaysSessionSampleRate: 0.1, // Capture 10% of all sessions

  // Environment
  environment: process.env.NODE_ENV,

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors that are expected
    'NetworkError',
    'Failed to fetch',
  ],

  // Before sending events
  beforeSend(event, hint) {
    // Filter out dev mode errors if needed
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      return null;
    }
    return event;
  },
});
```

### 3.2 Update Sentry Server Config

Edit `sentry.server.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Adjust for production

  // Environment
  environment: process.env.NODE_ENV,

  // Enhanced error context
  beforeSend(event, hint) {
    // Add custom context
    if (event.request) {
      // Scrub sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['x-api-key'];
      }
    }
    return event;
  },
});
```

### 3.3 Update Environment Variables

Add to `.env`:

```env
# Sentry (get from Sentry dashboard)
NEXT_PUBLIC_SENTRY_DSN="https://YOUR_KEY@o123456.ingest.sentry.io/123456"
SENTRY_AUTH_TOKEN="YOUR_AUTH_TOKEN"
SENTRY_ORG="your-org-name"
SENTRY_PROJECT="unchained-tickets"
```

**Get these values from:**
- Sentry Dashboard → Settings → Projects → unchained-tickets
- DSN: Settings → Client Keys (DSN)
- Auth Token: Settings → Auth Tokens → Create New Token

### 3.4 Add to Vercel Environment Variables

In Vercel dashboard:

```
NEXT_PUBLIC_SENTRY_DSN
Value: https://YOUR_KEY@o123456.ingest.sentry.io/123456
Environment: Production, Preview, Development

SENTRY_AUTH_TOKEN
Value: YOUR_AUTH_TOKEN
Environment: Production
⚠️ Mark as "Sensitive"

SENTRY_ORG
Value: your-org-name
Environment: Production

SENTRY_PROJECT
Value: unchained-tickets
Environment: Production
```

---

## Step 4: Custom Error Tracking (15 min)

### 4.1 Create Error Boundary

Create `components/ErrorBoundary.tsx`:

```typescript
'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-red-500">
              Something went wrong
            </h2>
            <p className="text-grit-300">
              We've been notified and are looking into it.
            </p>
            <Button
              onClick={() => this.setState({ hasError: false })}
              variant="primary"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4.2 Wrap Application

Update `app/layout.tsx`:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 4.3 Add Custom Error Tracking

Create `lib/monitoring/sentry.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

/**
 * Capture minting errors with context
 */
export function captureMintingError(error: Error, context: {
  ticketId?: string;
  eventId?: number;
  walletAddress?: string;
  transactionHash?: string;
}) {
  Sentry.captureException(error, {
    tags: {
      feature: 'nft-minting',
      operation: 'mint-ticket',
    },
    extra: context,
  });
}

/**
 * Capture webhook errors
 */
export function captureWebhookError(error: Error, context: {
  webhookType?: string;
  chargeId?: string;
  payload?: any;
}) {
  Sentry.captureException(error, {
    tags: {
      feature: 'webhook',
      operation: 'process-webhook',
    },
    extra: context,
  });
}

/**
 * Capture payment errors
 */
export function capturePaymentError(error: Error, context: {
  eventId?: number;
  amount?: number;
  currency?: string;
}) {
  Sentry.captureException(error, {
    tags: {
      feature: 'payment',
      operation: 'process-payment',
    },
    extra: context,
  });
}

/**
 * Track performance
 */
export function trackPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
  Sentry.captureMessage(`Performance: ${operation}`, {
    level: 'info',
    tags: {
      type: 'performance',
      operation,
    },
    extra: {
      duration,
      ...metadata,
    },
  });
}
```

### 4.4 Use in Minting Service

Update `lib/services/NFTMintingService.ts`:

```typescript
import { captureMintingError } from '@/lib/monitoring/sentry';

export async function mintTicket(request: MintTicketRequest): Promise<MintTicketResult> {
  try {
    // ... existing code ...
  } catch (error) {
    console.error('[NFTMintingService] Minting failed:', error);

    // Send to Sentry with context
    captureMintingError(error as Error, {
      eventId: request.eventId,
      walletAddress: request.recipient,
      tierId: request.tierId,
    });

    return {
      transactionHash: '0x0' as Hash,
      tokenId: 0n,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown minting error',
    };
  }
}
```

---

## Step 5: Set Up Alerts (10 min)

### 5.1 Create Alert Rules

1. Go to Sentry Dashboard → **Alerts** → **Create Alert**

2. **Alert Rule 1: High Error Rate**
   - Condition: When error count is > 10 per hour
   - Action: Send email notification
   - Notify: Team members

3. **Alert Rule 2: Failed Minting**
   - Condition: When event tag `feature=nft-minting` occurs
   - Frequency: Every occurrence
   - Action: Send Slack notification (optional)

4. **Alert Rule 3: Webhook Failures**
   - Condition: When event tag `feature=webhook` occurs
   - Frequency: Every 5 occurrences
   - Action: Send email + Slack

5. **Alert Rule 4: Performance Degradation**
   - Condition: When p95 response time > 3000ms
   - Action: Send email notification

### 5.2 Configure Integrations

**Slack Integration (Optional):**
1. Settings → Integrations → Slack
2. Connect workspace
3. Choose channel: `#alerts` or `#errors`
4. Test connection

**Email Notifications:**
1. Settings → Notifications
2. Add team member emails
3. Configure notification preferences

---

## Step 6: Test Monitoring (10 min)

### 6.1 Create Test Error Route

Create `app/api/test/sentry/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // Test error
    throw new Error('This is a test error from Sentry integration');
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        test: true,
      },
    });

    return NextResponse.json({
      message: 'Test error sent to Sentry',
      check: 'Go to Sentry dashboard to see the error',
    });
  }
}
```

### 6.2 Test Error Capture

```bash
# Start dev server
npm run dev

# Trigger test error
curl http://localhost:3000/api/test/sentry
```

### 6.3 Verify in Sentry

1. Go to Sentry Dashboard → **Issues**
2. Should see: "This is a test error from Sentry integration"
3. Click to view details:
   - Stack trace
   - Request info
   - Browser/OS info
   - Source maps (if uploaded)

---

## Step 7: Production Configuration (5 min)

### 7.1 Adjust Sample Rates

For production, reduce sample rates to manage costs:

Edit `sentry.client.config.ts`:

```typescript
Sentry.init({
  // ...
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.1,
});
```

### 7.2 Enable Source Maps Upload

In `next.config.ts`, Sentry wizard should have added:

```typescript
const nextConfig = {
  // ... existing config

  // Sentry webpack plugin (added by wizard)
  webpack: (config, { isServer }) => {
    // ... existing webpack config

    config.plugins.push(
      new (require('@sentry/webpack-plugin')).default({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        include: '.next',
        ignore: ['node_modules'],
        dryRun: process.env.NODE_ENV !== 'production',
      })
    );

    return config;
  },
};
```

---

## Step 8: Dashboard & Monitoring (5 min)

### 8.1 Key Metrics to Monitor

**Errors:**
- Total error count (daily/weekly)
- Error rate (errors per request)
- Most common errors
- Affected users

**Performance:**
- Response times (p50, p75, p95, p99)
- Slow database queries
- API endpoint performance
- Page load times

**Business Metrics:**
- Minting success rate
- Webhook processing time
- Payment success rate
- User session health

### 8.2 Create Custom Dashboard

1. Sentry Dashboard → **Dashboards** → **Create Dashboard**
2. Name: "Unchained Tickets Production"
3. Add widgets:
   - Error count by feature (tag)
   - Minting success rate
   - API response times
   - User sessions
   - Browser/Device distribution

---

## Monitoring Checklist

- [ ] Sentry account created
- [ ] Dependencies installed
- [ ] Configuration files created
- [ ] Environment variables set (local & Vercel)
- [ ] Error boundary implemented
- [ ] Custom error tracking added to critical paths
- [ ] Alert rules configured
- [ ] Test error sent and verified
- [ ] Production sample rates configured
- [ ] Source maps upload enabled
- [ ] Team notified about alerts
- [ ] Dashboard created

---

## Best Practices

### DO:
✅ Capture errors with context (user ID, transaction ID, etc.)
✅ Use tags to categorize errors by feature
✅ Set up alerts for critical paths (minting, payments)
✅ Monitor performance metrics
✅ Scrub sensitive data before sending to Sentry
✅ Review Sentry dashboard daily

### DON'T:
❌ Send passwords or private keys to Sentry
❌ Capture 100% of transactions in production (too expensive)
❌ Ignore repeated errors
❌ Set up alerts without testing them
❌ Forget to rotate Sentry auth tokens

---

## Costs

**Free Tier:**
- 5,000 errors/month
- 10,000 performance transactions/month
- Sufficient for MVP launch (< 1,000 users)

**Team Plan ($26/month):**
- 50,000 errors/month
- 100,000 performance transactions/month
- Recommended when you hit free tier limits

**Business Plan ($80/month):**
- 500,000 errors/month
- 500,000 performance transactions/month
- Needed for scale (10,000+ users)

---

## Troubleshooting

**Issue: Source maps not uploading**
```bash
# Check auth token
echo $SENTRY_AUTH_TOKEN

# Test upload manually
npx @sentry/cli releases files VERSION upload-sourcemaps .next
```

**Issue: Too many errors**
```typescript
// Increase ignoreErrors list
ignoreErrors: [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
],
```

**Issue: Performance overhead**
```typescript
// Reduce sample rates
tracesSampleRate: 0.05, // 5% instead of 10%
```

---

## Next Steps

After monitoring setup:
1. ✅ Test in development
2. ✅ Deploy to production with Sentry enabled
3. ✅ Monitor for 24 hours
4. ✅ Adjust alert thresholds
5. ✅ Train team on responding to alerts

---

**Monitoring setup complete!** 🎉

You'll now get real-time notifications about errors and performance issues.
