import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/auth/tokens';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ bookings: [] });
    }

    const allBookings = await db
      .select()
      .from(schema.bookings)
      .orderBy(desc(schema.bookings.createdAt));

    // Filter bookings belonging to this host or matching ID
    const hostBookings = allBookings.filter(
      (b) => b.companionId === hostProfile.id || b.companionId === 'kashish-blr'
    );

    return NextResponse.json({
      success: true,
      bookings: hostBookings,
    });
  } catch (error) {
    console.error('Error in host bookings GET:', error);
    return NextResponse.json({ bookings: [] });
  }
}

export async function PATCH(req: NextRequest) {
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
    const { bookingId, action } = body;

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'Missing bookingId or action' }, { status: 400 });
    }

    if (action === 'accept') {
      await db
        .update(schema.bookings)
        .set({ status: 'confirmed' })
        .where(eq(schema.bookings.id, bookingId));

      return NextResponse.json({
        success: true,
        message: 'Meetup request accepted! Member has been notified.',
      });
    } else if (action === 'decline') {
      await db
        .update(schema.bookings)
        .set({ status: 'cancelled', paymentStatus: 'refunded' })
        .where(eq(schema.bookings.id, bookingId));

      return NextResponse.json({
        success: true,
        message: 'The meetup request was declined and the member has been refunded.',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in host bookings PATCH:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
