'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc } from 'drizzle-orm';
import { COMPANIONS } from '@/lib/data/companions';

export interface BookingDisplayItem {
  id: string;
  companion: typeof COMPANIONS[0];
  companionId: string;
  memberName: string;
  memberPhone: string;
  activity: string;
  date: string;
  time: string;
  duration: string;
  meetingPoint: string;
  startCode: string;
  escrowAmount: number;
  status: string;
  rawStatus: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | string;
  paymentStatus: 'paid_escrow' | 'refunded' | 'released' | string;
}

export async function fetchLiveBookings(filter?: {
  memberId?: string;
  memberPhone?: string;
}): Promise<BookingDisplayItem[]> {
  try {
    const list = await db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt));

    // Filter by member if provided
    const filteredList = list.filter((b) => {
      if (filter?.memberId && b.memberId === filter.memberId) return true;
      if (filter?.memberPhone && b.memberPhone.includes(filter.memberPhone.slice(-10))) return true;
      if (!filter?.memberId && !filter?.memberPhone) return true;
      return false;
    });

    return filteredList.map((b) => {
      const comp = COMPANIONS.find((c) => c.id === b.companionId) || {
        ...COMPANIONS[0],
        id: b.companionId || 'kashish-blr',
        name: b.companionId || COMPANIONS[0].name,
      };

      let displayStatus = 'Ready for Code Verification';
      if (b.status === 'in_progress') displayStatus = 'Active Meetup In Progress';
      else if (b.status === 'completed') displayStatus = 'Completed';
      else if (b.status === 'cancelled') displayStatus = 'Cancelled & Refunded';

      return {
        id: b.id,
        companion: comp,
        companionId: b.companionId || 'kashish-blr',
        memberName: b.memberName,
        memberPhone: b.memberPhone,
        activity: b.activitySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        date: b.date,
        time: b.startTime,
        duration: `${b.durationHours} Hour${b.durationHours > 1 ? 's' : ''}`,
        meetingPoint: b.meetingPoint,
        startCode: b.startCode,
        escrowAmount: b.totalPayable,
        status: displayStatus,
        rawStatus: b.status || 'confirmed',
        paymentStatus: b.paymentStatus || 'paid_escrow',
      };
    });
  } catch (err) {
    console.error('Failed to fetch bookings from Neon Postgres:', err);
    return [];
  }
}
