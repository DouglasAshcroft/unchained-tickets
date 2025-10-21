import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/AuthService';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser> {
  const token = getAuthToken(request);

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const payload = authService.verifyToken(token);
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    throw new Error('Invalid token');
  }
}

export async function verifyAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await verifyAuth(request);

  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}

export async function verifyArtist(request: NextRequest): Promise<AuthUser> {
  const user = await verifyAuth(request);

  if (user.role !== 'artist' && user.role !== 'admin') {
    throw new Error('Artist access required');
  }

  return user;
}

export async function verifyVenue(request: NextRequest): Promise<AuthUser> {
  const user = await verifyAuth(request);

  if (user.role !== 'venue' && user.role !== 'admin') {
    throw new Error('Venue access required');
  }

  return user;
}

export async function verifyArtistOrVenue(request: NextRequest): Promise<AuthUser> {
  const user = await verifyAuth(request);

  if (user.role !== 'artist' && user.role !== 'venue' && user.role !== 'admin') {
    throw new Error('Artist or Venue access required');
  }

  return user;
}
