import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const liveness = {
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  };

  return NextResponse.json(liveness);
}
