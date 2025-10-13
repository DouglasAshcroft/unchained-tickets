/**
 * POST /api/advocacy/send-emails
 *
 * Batch send advocacy emails (for cron job)
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/services/EmailService';

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication/API key validation for cron jobs
    const { limit = 10 } = await request.json();

    const sentCount = await emailService.sendBatchAdvocacyEmails(limit);

    return NextResponse.json({
      success: true,
      sentCount,
    });
  } catch (error: any) {
    console.error('Batch email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send batch emails' },
      { status: 500 }
    );
  }
}
