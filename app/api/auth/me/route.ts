import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { authService } from '@/lib/services/AuthService';

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);

    const user = await authService.getUserById(authUser.id);

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'User not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Get current user error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
