import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const readiness = {
    status: 'ready' as 'ready' | 'not ready',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    readiness.checks.database = { status: 'pass', time: Date.now() };
  } catch (error: any) {
    readiness.checks.database = {
      status: 'fail',
      time: Date.now(),
      error: error.message,
    };
    readiness.status = 'not ready';
  }

  // Memory check
  const memoryUsage = process.memoryUsage();
  const memoryThreshold = 500 * 1024 * 1024; // 500MB

  readiness.checks.memory = {
    status: memoryUsage.heapUsed < memoryThreshold ? 'pass' : 'warn',
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    time: Date.now(),
  };

  const statusCode = readiness.status === 'ready' ? 200 : 503;
  return NextResponse.json(readiness, { status: statusCode });
}
