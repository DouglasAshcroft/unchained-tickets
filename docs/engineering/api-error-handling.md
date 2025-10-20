# API Error Handling Guide

This guide demonstrates how to use the standardized error handling utilities in [lib/utils/apiError.ts](../lib/utils/apiError.ts).

## Quick Start

### Basic Usage

```typescript
import { handleApiError, ApiErrors, apiLogger } from '@/lib/utils/apiError';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    apiLogger.info('GetEvent', 'Fetching event', { id: 123 });

    const event = await prisma.event.findUnique({ where: { id: 123 } });

    if (!event) {
      throw ApiErrors.notFound('Event');
    }

    return NextResponse.json({ event });
  } catch (error) {
    return handleApiError(error, 'GetEvent');
  }
}
```

## Error Types

### Using ApiErrors Helpers

```typescript
// 400 Bad Request
throw ApiErrors.badRequest('Invalid email format', { field: 'email' });

// 401 Unauthorized
throw ApiErrors.unauthorized('Please log in');

// 403 Forbidden
throw ApiErrors.forbidden('Admin access required');

// 404 Not Found
throw ApiErrors.notFound('Event'); // "Event not found"

// 409 Conflict
throw ApiErrors.conflict('Email already registered', { email: 'user@example.com' });

// 422 Validation Error
throw ApiErrors.validationError('Invalid input', {
  errors: [{ field: 'email', message: 'Required' }]
});

// 429 Rate Limit
throw ApiErrors.rateLimitExceeded();

// 500 Internal Error
throw ApiErrors.internal('Database connection failed');

// 503 Service Unavailable
throw ApiErrors.serviceUnavailable('Payment provider is down');
```

## Logging

### Structured Logging

```typescript
import { apiLogger } from '@/lib/utils/apiError';

// Info logging
apiLogger.info('CreateTicket', 'Ticket created successfully', {
  ticketId: 'abc123',
  eventId: 42,
  userId: 1,
});

// Warning logging
apiLogger.warn('PaymentRetry', 'Payment failed, retrying', {
  attempt: 2,
  maxRetries: 3,
});

// Error logging
apiLogger.error('MintingFailed', 'NFT minting failed', error);

// Critical logging (for production alerts)
apiLogger.critical('PaymentProcessor', 'Payment webhook verification failed', {
  chargeId: 'ch_123',
  signature: 'invalid',
});
```

## Complete Examples

### Example 1: Event API Route

```typescript
// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ApiErrors, apiLogger } from '@/lib/utils/apiError';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id, 10);

    if (isNaN(eventId)) {
      throw ApiErrors.badRequest('Event ID must be a number');
    }

    apiLogger.info('GetEvent', 'Fetching event', { eventId });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        startsAt: true,
        status: true,
        venue: {
          select: {
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!event) {
      throw ApiErrors.notFound('Event');
    }

    if (event.status === 'draft') {
      throw ApiErrors.forbidden('This event is not yet published');
    }

    return NextResponse.json({ event });
  } catch (error) {
    return handleApiError(error, 'GetEvent');
  }
}
```

### Example 2: Checkout API with Validation

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ApiErrors, apiLogger } from '@/lib/utils/apiError';
import { verifyAuth } from '@/lib/utils/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const body = await request.json();
    const { eventId, ticketTypeId, quantity } = body;

    // Validate input
    if (!eventId || !ticketTypeId || !quantity) {
      throw ApiErrors.validationError('Missing required fields', {
        errors: [
          !eventId && { field: 'eventId', message: 'Required' },
          !ticketTypeId && { field: 'ticketTypeId', message: 'Required' },
          !quantity && { field: 'quantity', message: 'Required' },
        ].filter(Boolean),
      });
    }

    if (quantity < 1 || quantity > 10) {
      throw ApiErrors.badRequest('Quantity must be between 1 and 10');
    }

    apiLogger.info('CreateCheckout', 'Starting checkout', {
      userId: user.id,
      eventId,
      quantity,
    });

    // Check ticket availability
    const ticketType = await prisma.eventTicketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!ticketType) {
      throw ApiErrors.notFound('Ticket type');
    }

    if (!ticketType.isActive) {
      throw ApiErrors.conflict('This ticket type is no longer available');
    }

    // Create checkout in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tickets...
      // Process payment...
      return { checkoutId: 'ch_123' };
    });

    apiLogger.info('CreateCheckout', 'Checkout completed', {
      userId: user.id,
      checkoutId: result.checkoutId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'CreateCheckout');
  }
}
```

### Example 3: Admin API with RBAC

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ApiErrors, apiLogger } from '@/lib/utils/apiError';
import { verifyAdmin } from '@/lib/utils/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await verifyAdmin(request);

    apiLogger.info('ListUsers', 'Admin accessing user list', {
      adminId: admin.id,
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error, 'ListUsers');
  }
}
```

### Example 4: Critical Flow with Detailed Logging

```typescript
// app/api/webhooks/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ApiErrors, apiLogger } from '@/lib/utils/apiError';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    const body = await request.text();

    apiLogger.info('PaymentWebhook', 'Received payment webhook');

    // Verify signature
    if (!signature) {
      apiLogger.critical('PaymentWebhook', 'Missing signature', { body });
      throw ApiErrors.unauthorized('Invalid webhook signature');
    }

    // Verify webhook signature
    const isValid = verifySignature(body, signature);
    if (!isValid) {
      apiLogger.critical('PaymentWebhook', 'Invalid signature', {
        signature,
        bodyLength: body.length,
      });
      throw ApiErrors.unauthorized('Invalid webhook signature');
    }

    const event = JSON.parse(body);

    apiLogger.info('PaymentWebhook', 'Processing payment event', {
      type: event.type,
      chargeId: event.data.id,
    });

    // Process the payment
    await prisma.charge.update({
      where: { chargeId: event.data.id },
      data: { status: 'confirmed' },
    });

    apiLogger.info('PaymentWebhook', 'Payment processed successfully', {
      chargeId: event.data.id,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    apiLogger.critical('PaymentWebhook', 'Webhook processing failed', error);
    return handleApiError(error, 'PaymentWebhook');
  }
}

function verifySignature(body: string, signature: string): boolean {
  // Implementation...
  return true;
}
```

## Error Response Format

All errors return a consistent JSON format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Event not found",
    "details": {
      "eventId": 123
    }
  }
}
```

## Best Practices

1. **Always use `handleApiError` in catch blocks**
   - It provides consistent error responses
   - Automatically logs errors
   - Sanitizes errors in production

2. **Use specific error types**
   - Don't use generic 500 errors for known failure cases
   - Use appropriate HTTP status codes

3. **Include context in logs**
   - Add relevant IDs and parameters
   - Makes debugging much easier

4. **Use critical logging for production alerts**
   - Payment failures
   - Authentication issues
   - Data inconsistencies

5. **Keep error messages user-friendly**
   - Don't expose internal details in production
   - `handleApiError` handles this automatically

## Testing

```typescript
import { ApiErrors } from '@/lib/utils/apiError';

describe('API Error Handling', () => {
  it('should throw 404 for missing resources', () => {
    expect(() => {
      throw ApiErrors.notFound('Event');
    }).toThrow('Event not found');
  });

  it('should include details in error', () => {
    const error = ApiErrors.validationError('Invalid input', {
      field: 'email',
    });

    expect(error.details).toEqual({ field: 'email' });
    expect(error.statusCode).toBe(422);
  });
});
```

## Migration Guide

### Before (Inconsistent Error Handling)

```typescript
export async function GET(request: NextRequest) {
  try {
    const event = await prisma.event.findUnique({ where: { id: 1 } });
    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

### After (Standardized Error Handling)

```typescript
import { handleApiError, ApiErrors, apiLogger } from '@/lib/utils/apiError';

export async function GET(request: NextRequest) {
  try {
    apiLogger.info('GetEvent', 'Fetching event', { id: 1 });

    const event = await prisma.event.findUnique({ where: { id: 1 } });

    if (!event) {
      throw ApiErrors.notFound('Event');
    }

    return NextResponse.json({ event });
  } catch (error) {
    return handleApiError(error, 'GetEvent');
  }
}
```

## Benefits

- ✅ **Consistent error responses** across all API routes
- ✅ **Structured logging** for monitoring and debugging
- ✅ **Production-safe** error messages
- ✅ **Type-safe** error codes
- ✅ **Easy to test** error scenarios
- ✅ **Centralized** error handling logic

---

For more examples, see existing API routes in `app/api/` that have been updated to use this pattern.
