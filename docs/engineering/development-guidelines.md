# Unchained Tickets - Development Guidelines

## 🎯 Core Principles

### 1. Build for Production First

**Always implement production code as the primary path, not mocks.**

❌ **WRONG** - Mock as primary implementation:
```typescript
// DO NOT DO THIS
export function getPerks() {
  return [
    { name: "Free Drink", quantity: 2 },
    { name: "VIP Access", quantity: 1 }
  ];
}
```

✅ **CORRECT** - Database as primary, mocks only for testing:
```typescript
// Production code
export async function getPerks(ticketTypeId: number) {
  return await prisma.ticketPerk.findMany({
    where: { ticketTypeId }
  });
}

// Separate test utility (in __tests__ or test-utils/)
export function getMockPerks() {
  return [
    { name: "Free Drink", quantity: 2 },
    { name: "VIP Access", quantity: 1 }
  ];
}
```

### 2. Mock Functions Only for Testing

Mock functions should ONLY exist in:
- `__tests__/` directories
- `test-utils/` or similar testing utilities
- Seeding scripts (`scripts/seed.ts`)
- Development mode utilities (clearly marked as DEV ONLY)

**Never use mocks in**:
- API routes
- Service layer
- Repository layer
- UI components (unless explicitly for loading states)

### 3. Database is Source of Truth

All data should flow from the database:
- Prisma schema defines structure
- Repositories query the database
- Services orchestrate business logic
- APIs expose endpoints
- UI components render database data

### 4. TypeScript Types from Schema

Generate types from Prisma schema, don't duplicate:

✅ **CORRECT**:
```typescript
import { TicketPerk, EventTicketType } from '@prisma/client';

type TicketTypeWithPerks = EventTicketType & {
  perks: TicketPerk[];
};
```

❌ **WRONG**:
```typescript
// Don't manually duplicate Prisma types
type TicketPerk = {
  id: number;
  name: string;
  // ...this gets out of sync
};
```

## 🏗️ Architecture Patterns

### Repository Pattern

Repositories handle **data access only**:

```typescript
// lib/repositories/EventRepository.ts
export class EventRepository {
  async findById(id: number) {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: {
          include: {
            perks: true  // ✅ Include related data
          }
        }
      }
    });
  }
}
```

### Service Pattern

Services handle **business logic**:

```typescript
// lib/services/EventService.ts
export class EventService {
  async getEventById(id: number) {
    const event = await eventRepository.findById(id);
    if (!event) throw new Error('Event not found');

    // Business logic: calculate available tickets
    const availableTickets = calculateAvailability(event);

    return {
      ...event,
      availableTickets
    };
  }
}
```

### API Pattern

APIs expose **endpoints** and handle HTTP:

```typescript
// app/api/events/[id]/route.ts
export async function GET(request: Request, { params }) {
  const event = await eventService.getEventById(params.id);
  return NextResponse.json(event);
}
```

## 🧪 Testing Strategy

### Unit Tests
Test individual functions with mocks:
```typescript
// __tests__/unit/eventService.test.ts
import { getMockEvent } from '../test-utils/mocks';

describe('EventService', () => {
  it('calculates available tickets', () => {
    const event = getMockEvent();  // ✅ Mock for test
    const available = calculateAvailability(event);
    expect(available).toBe(50);
  });
});
```

### Integration Tests
Test with real database (test DB):
```typescript
// __tests__/integration/eventService.test.ts
describe('EventService Integration', () => {
  it('creates event with perks', async () => {
    const event = await eventService.createEvent({
      title: 'Test Event',
      ticketTypes: [{
        name: 'VIP',
        perks: [{ name: 'Free Drink', quantity: 2 }]
      }]
    });

    // ✅ Verify in real database
    const saved = await prisma.event.findUnique({
      where: { id: event.id },
      include: { ticketTypes: { include: { perks: true } } }
    });

    expect(saved.ticketTypes[0].perks).toHaveLength(1);
  });
});
```

## 📁 File Structure

```
/lib
  /repositories      # Data access (Prisma queries)
  /services         # Business logic
  /validators       # Zod schemas
  /utils           # Pure utility functions

/app
  /api             # Next.js API routes
  /[page]          # UI pages

/__tests__
  /unit            # Unit tests with mocks
  /integration     # Integration tests with test DB
  /test-utils      # Mock factories
    /mocks.ts      # ✅ Mock functions live here
```

## 🚀 Development Workflow

### 1. Schema First
```bash
# 1. Update Prisma schema
vim prisma/schema.prisma

# 2. Create migration
npm run db:migrate:dev

# 3. Generate Prisma client
npm run db:generate
```

### 2. Repository Layer
```typescript
// Add database query
export class EventRepository {
  async findWithPerks(id: number) {
    return await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: { include: { perks: true } } }
    });
  }
}
```

### 3. Service Layer
```typescript
// Add business logic
export class EventService {
  async getEventWithPerks(id: number) {
    const event = await eventRepository.findWithPerks(id);
    // Add any transformations/calculations
    return event;
  }
}
```

### 4. API Layer
```typescript
// Expose endpoint
export async function GET(req: Request) {
  const event = await eventService.getEventWithPerks(id);
  return NextResponse.json(event);
}
```

### 5. UI Layer
```typescript
// Render in component
export default async function EventPage({ params }) {
  const event = await eventService.getEventWithPerks(params.id);
  return <EventDetails event={event} />;
}
```

## ✅ Code Review Checklist

Before submitting PR:

- [ ] No mock functions in production paths
- [ ] Database queries use Prisma
- [ ] Types generated from schema
- [ ] Validation uses Zod
- [ ] Error handling in place
- [ ] API routes have try/catch
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)

## 🔍 Common Mistakes

### 1. Using Mocks in Production

❌ **WRONG**:
```typescript
// app/my-tickets/page.tsx
const getMockPerks = (tier: string) => {
  if (tier === 'VIP') return [{ name: 'Free Drink', quantity: 2 }];
  return [];
};

// Later in component
const perks = getMockPerks(purchase.tier);
```

✅ **CORRECT**:
```typescript
// app/my-tickets/page.tsx
const ticket = await fetch(`/api/tickets/${id}`).then(r => r.json());
const perks = ticket.tierPerks;  // From database
```

### 2. Skipping Validation

❌ **WRONG**:
```typescript
export async function POST(req: Request) {
  const body = await req.json();
  // Trusting user input directly
  await prisma.event.create({ data: body });
}
```

✅ **CORRECT**:
```typescript
import { EventCreateSchema } from '@/lib/validators/eventSchemas';

export async function POST(req: Request) {
  const body = await req.json();
  const validated = EventCreateSchema.parse(body);  // ✅ Validate first
  await prisma.event.create({ data: validated });
}
```

### 3. Missing Error Handling

❌ **WRONG**:
```typescript
export async function getEvent(id: number) {
  return await prisma.event.findUnique({ where: { id } });
}
```

✅ **CORRECT**:
```typescript
export async function getEvent(id: number) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error('Event not found');
  return event;
}
```

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zod Documentation](https://zod.dev)
- [OnchainKit Documentation](https://docs.base.org/onchainkit)

## 🎓 Training Examples

See these files for production-ready examples:

- **Perk System**: `PERK_SYSTEM_PRODUCTION.md`
- **Event Creation**: `app/events/new/page.tsx`
- **API Validation**: `app/api/tickets/validate/route.ts`
- **Service Layer**: `lib/services/EventService.ts`
- **Repository Layer**: `lib/repositories/EventRepository.ts`

---

**Remember**: Build for production first. Mocks are for testing only.

**Last Updated**: 2025-10-12
