import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAccessToken, signAccessToken } from '@/lib/auth/tokens';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, setAuthCookies } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(accessToken);
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const body = await req.json();
    const targetRole = body?.role === 'host' ? 'host' : 'member';

    // If trying to switch to host, verify that user has an approved host profile
    if (targetRole === 'host') {
      const [hostProfile] = await db
        .select()
        .from(schema.hostProfiles)
        .where(eq(schema.hostProfiles.userId, decoded.userId))
        .limit(1);

      if (!hostProfile || hostProfile.verificationStatus !== 'approved') {
        return NextResponse.json(
          { error: 'You must have an approved Host profile to switch to Host mode.' },
          { status: 403 }
        );
      }
    }

    // Update activeRole in users table
    await db
      .update(schema.users)
      .set({ activeRole: targetRole, updatedAt: new Date() })
      .where(eq(schema.users.id, decoded.userId));

    // Sign new access token with updated role
    const newAccessToken = await signAccessToken({
      userId: decoded.userId,
      phone: decoded.phone,
      role: targetRole,
    });

    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value || '';

    const response = NextResponse.json({
      success: true,
      activeRole: targetRole,
    });

    return setAuthCookies(response, newAccessToken, refreshToken);
  } catch (error) {
    console.error('Error switching role:', error);
    return NextResponse.json(
      { error: 'Failed to switch role' },
      { status: 500 }
    );
  }
}
