import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/AuthService';
import { checkRateLimit, decrementRateLimit, getClientIdentifier, RateLimits } from '@/lib/utils/rateLimit';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting: 5 attempts per 15 minutes
  const identifier = getClientIdentifier(request);
  const rateLimit = checkRateLimit(identifier, RateLimits.AUTH);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const userData = RegisterSchema.parse(body);

    const result = await authService.register(userData);

    // Success - decrement rate limit count (don't count successful registrations)
    decrementRateLimit(identifier);

    return NextResponse.json(result, {
      status: 201,
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': (rateLimit.remaining + 1).toString(),
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (error.message === 'Email already registered') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
