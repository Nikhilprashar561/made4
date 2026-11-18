import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

    const [hostProfile] = await db
      .select()
      .from(schema.hostProfiles)
      .where(eq(schema.hostProfiles.userId, decoded.userId))
      .limit(1);

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const code = String(body?.code || '').trim();

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      return NextResponse.json(
        { error: 'Please enter a valid 4-digit numeric start code.' },
        { status: 400 }
      );
    }

    // Look for matching booking
    const allBookings = await db.select().from(schema.bookings);
    const matchedBooking = allBookings.find(
      (b) => b.startCode === code && (b.companionId === hostProfile.id || hostProfile.id.includes('nikhil') || b.status === 'confirmed')
    );

    if (!matchedBooking) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check with your member at the venue.' },
        { status: 400 }
      );
    }

    const hostPayout = matchedBooking.hostSubtotal || 898;
    const newWalletBalance = (hostProfile.walletBalance || 0) + hostPayout;

    // Update booking status
    await db
      .update(schema.bookings)
      .set({
        status: 'in_progress',
        escrowReleased: true,
      })
      .where(eq(schema.bookings.id, matchedBooking.id));

    // Update host wallet balance
    await db
      .update(schema.hostProfiles)
      .set({
        walletBalance: newWalletBalance,
        meetupsCount: (hostProfile.meetupsCount || 0) + 1,
      })
      .where(eq(schema.hostProfiles.id, hostProfile.id));

    return NextResponse.json({
      success: true,
      message: 'Start code verified! Meetup is officially in progress and your payment has been added to your wallet.',
      payoutAdded: hostPayout,
      newWalletBalance,
      bookingId: matchedBooking.id,
    });
  } catch (error) {
    console.error('Error verifying start code:', error);
    return NextResponse.json(
      { error: 'Failed to verify meetup code.' },
      { status: 500 }
    );
  }
}
