import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { profileService } from '@/lib/services/ProfileService';

/**
 * PATCH /api/profile/settings
 * Update user profile settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    const body = await request.json();
    const userId = authUser.id;

    const updateData: any = {};

    if (body.notificationsEnabled !== undefined) {
      updateData.notificationsEnabled = Boolean(body.notificationsEnabled);
    }
    if (body.emailMarketing !== undefined) {
      updateData.emailMarketing = Boolean(body.emailMarketing);
    }
    if (body.theme !== undefined) {
      updateData.theme = body.theme;
    }
    if (body.language !== undefined) {
      updateData.language = body.language;
    }
    if (body.timezone !== undefined) {
      updateData.timezone = body.timezone;
    }

    const settings = await profileService.updateProfileSettings(userId, updateData);

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
