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
    const bookingId = String(body?.bookingId || '').trim();
    const reason = String(body?.reason || 'User cancelled').trim();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const [booking] = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    // Verify ownership
    if (booking.memberId && booking.memberId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to cancel this booking.' },
        { status: 403 }
      );
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'This booking has already been cancelled.' },
        { status: 400 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { error: 'Completed meetups cannot be cancelled.' },
        { status: 400 }
      );
    }

    // Update booking status to cancelled & payment status to refunded
    await db
      .update(schema.bookings)
      .set({
        status: 'cancelled',
        paymentStatus: 'refunded',
      })
      .where(eq(schema.bookings.id, bookingId));

    return NextResponse.json({
      success: true,
      message: `Meetup #${bookingId} has been cancelled successfully. 100% full refund of ₹${booking.totalPayable} has been processed.`,
      bookingId,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking. Please try again.' },
      { status: 500 }
    );
  }
}
