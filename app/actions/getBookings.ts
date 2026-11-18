'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc } from 'drizzle-orm';
import { COMPANIONS } from '@/lib/data/companions';

export interface BookingDisplayItem {
  id: string;
  companion: typeof COMPANIONS[0];
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
        name: b.companionId || COMPANIONS[0].name,
      };
      return {
        id: b.id,
        companion: comp,
        memberName: b.memberName,
        memberPhone: b.memberPhone,
        activity: b.activitySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        date: b.date,
        time: b.startTime,
        duration: `${b.durationHours} Hour${b.durationHours > 1 ? 's' : ''}`,
        meetingPoint: b.meetingPoint,
        startCode: b.startCode,
        escrowAmount: b.totalPayable,
        status: (b.status === 'confirmed' ? 'Ready for Code Verification' : b.status) || 'Ready for Code Verification',
      };
    });
  } catch (err) {
    console.error('Failed to fetch bookings from Neon Postgres:', err);
    return [];
  }
}
