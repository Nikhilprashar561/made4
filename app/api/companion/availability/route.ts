import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/auth/tokens';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/session';

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

    const body = await req.json().catch(() => ({}));
    const isFreeToday = Boolean(body?.isFreeToday);

    const [hostProfile] = await db
      .select()
      .from(schema.hostProfiles)
      .where(eq(schema.hostProfiles.userId, decoded.userId))
      .limit(1);

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found.' }, { status: 404 });
    }

    await db
      .update(schema.hostProfiles)
      .set({ isFreeToday })
      .where(eq(schema.hostProfiles.id, hostProfile.id));

    // Also update public companions catalogue
    await db
      .update(schema.companions)
      .set({ isFreeToday })
      .where(eq(schema.companions.id, hostProfile.id));

    return NextResponse.json({
      success: true,
      isFreeToday,
      message: `Availability updated to: ${isFreeToday ? 'Available Today' : 'Not Available Today'}`,
    });
  } catch (error) {
    console.error('Error in availability route:', error);
    return NextResponse.json(
      { error: 'Failed to update availability.' },
      { status: 500 }
    );
  }
}
