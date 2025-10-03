import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/AuthService';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const credentials = LoginSchema.parse(body);

    const result = await authService.login(credentials);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (error.message === 'Invalid credentials') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
