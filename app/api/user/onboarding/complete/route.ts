import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    const userId = authUser.id;

    // Update user's onboarding status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { onboardingComplete: true },
    });

    return NextResponse.json({
      success: true,
      onboardingComplete: updatedUser.onboardingComplete,
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
