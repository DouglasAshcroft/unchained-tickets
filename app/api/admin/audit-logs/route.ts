import { NextRequest, NextResponse } from 'next/server';
import { venueSupportService } from '@/lib/services/VenueSupportService';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated user ID from session/JWT and verify admin role
    const searchParams = request.nextUrl.searchParams;
    const requesterId = searchParams.get('requesterId');

    if (!requesterId) {
      return NextResponse.json({ error: 'Missing requesterId' }, { status: 400 });
    }

    // Verify requester is admin
    const requester = await prisma.user.findUnique({
      where: { id: parseInt(requesterId, 10) },
      select: { role: true },
    });

    if (!requester || requester.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Parse filter parameters
    const userId = searchParams.get('userId')
      ? parseInt(searchParams.get('userId')!, 10)
      : undefined;
    const action = searchParams.get('action') || undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : 100;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!, 10)
      : 0;

    const result = await venueSupportService.getAuditLogs({
      userId,
      action,
      startDate,
      endDate,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
