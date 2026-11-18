'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { revalidatePath } from 'next/cache';

export interface CreateBookingInput {
  companionId: string;
  memberName: string;
  memberPhone: string;
  memberEmail?: string;
  activitySlug: string;
  date: string;
  startTime: string;
  durationHours: number;
  meetingPoint: string;
  note?: string;
  hourlyRate: number;
  razorpayPaymentId?: string;
}

export async function createBookingAction(input: CreateBookingInput) {
  try {
    const hostSubtotal = input.hourlyRate * input.durationHours;
    const connectionFee = Math.round(hostSubtotal * 0.1);
    const gst = Math.round(connectionFee * 0.18);
    const totalPayable = hostSubtotal + connectionFee + gst;

    // Generate 4-digit mutual start verification code
    const startCode = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingId = `tog-book-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: schema.InsertBooking = {
      id: bookingId,
      companionId: input.companionId,
      memberName: input.memberName,
      memberPhone: input.memberPhone,
      memberEmail: input.memberEmail || null,
      activitySlug: input.activitySlug,
      date: input.date,
      startTime: input.startTime,
      durationHours: input.durationHours,
      meetingPoint: input.meetingPoint,
      note: input.note || null,
      hourlyRate: input.hourlyRate,
      hostSubtotal,
      connectionFee,
      gst,
      totalPayable,
      startCode,
      status: 'confirmed',
      paymentStatus: 'paid_escrow',
      razorpayOrderId: `order_rzp_${Date.now()}`,
      razorpayPaymentId: input.razorpayPaymentId || `pay_test_${Math.random().toString(36).substring(7)}`,
      escrowReleased: false,
    };

    await db.insert(schema.bookings).values(newBooking);

    try {
      revalidatePath('/bookings');
    } catch {
      // Invariant error occurs if invoked outside Next.js request context (e.g. test scripts)
    }

    return {
      success: true,
      bookingId,
      startCode,
      totalPayable,
    };
  } catch (error) {
    console.error('Error in createBookingAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking in database',
    };
  }
}
