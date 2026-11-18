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

    const [memberProfile] = await db
      .select()
      .from(schema.memberProfiles)
      .where(eq(schema.memberProfiles.userId, decoded.userId))
      .limit(1);

    const body = await req.json().catch(() => ({}));
    const companionId = String(body?.companionId || '').trim();
    const bookingId = String(body?.bookingId || '').trim();
    const rating = Math.min(5, Math.max(1, parseInt(body?.rating || '5', 10)));
    const activityName = String(body?.activityName || 'Social Meetup').trim();
    const comment = String(body?.comment || '').trim();

    if (!companionId) {
      return NextResponse.json({ error: 'Companion ID is required.' }, { status: 400 });
    }

    if (!comment || comment.length < 5) {
      return NextResponse.json(
        { error: 'Please enter a genuine review (at least 5 characters).' },
        { status: 400 }
      );
    }

    const reviewId = `rev_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

    const authorName = memberProfile?.fullName || 'Verified Member';
    const authorCity = memberProfile?.city ? memberProfile.city.charAt(0).toUpperCase() + memberProfile.city.slice(1) : 'Bengaluru';

    // Insert into reviews table
    await db.insert(schema.reviews).values({
      id: reviewId,
      companionId,
      authorName,
      authorCity,
      rating,
      date: formattedDate,
      activityName,
      comment,
    });

    // If companion exists in companions catalog, increment reviewCount
    const [comp] = await db
      .select()
      .from(schema.companions)
      .where(eq(schema.companions.id, companionId))
      .limit(1);

    if (comp) {
      await db
        .update(schema.companions)
        .set({
          reviewCount: (comp.reviewCount || 0) + 1,
        })
        .where(eq(schema.companions.id, companionId));
    }

    // If bookingId provided, mark booking as completed
    if (bookingId) {
      await db
        .update(schema.bookings)
        .set({ status: 'completed' })
        .where(eq(schema.bookings.id, bookingId));
    }

    return NextResponse.json({
      success: true,
      message: 'Your review has been submitted and added to the companion profile!',
      reviewId,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review. Please try again.' },
      { status: 500 }
    );
  }
}
