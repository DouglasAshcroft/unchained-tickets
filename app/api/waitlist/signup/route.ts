/**
 * POST /api/waitlist/signup
 *
 * Sign up for waitlist (without advocacy action)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, referredByCode } = await request.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if already signed up
    const existing = await prisma.waitlistSignup.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Generate referral code
    const referralCode = generateReferralCode();

    // Create waitlist signup
    const signup = await prisma.waitlistSignup.create({
      data: {
        email: email.toLowerCase(),
        referralCode,
        referredByCode: referredByCode || null,
        confirmedAt: new Date(),
      },
    });

    // If referred, reward referrer
    if (referredByCode) {
      await prisma.waitlistSignup.updateMany({
        where: { referralCode: referredByCode },
        data: {
          rewards: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      referralCode: signup.referralCode,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 500 }
    );
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
