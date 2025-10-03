import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/AuthService';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userData = RegisterSchema.parse(body);

    const result = await authService.register(userData);

    return NextResponse.json(result, { status: 201 });
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
