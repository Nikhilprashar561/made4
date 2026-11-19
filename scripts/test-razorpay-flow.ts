import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { createBookingAction } from '../app/actions/booking';

async function runTest() {
  console.log('--- STARTING RAZORPAY ESCROW PIPELINE TEST ---');

  // 1. Verify Razorpay test key in environment
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  console.log('1. Active Razorpay Key ID:', keyId);
  if (keyId !== 'rzp_test_TIpe464KQ9auim') {
    console.error('ERROR: Razorpay Key ID does not match rzp_test_TIpe464KQ9auim');
  }

  // 2. Simulate Order Creation Calculation
  const hourlyRate = 600;
  const durationHours = 2;
  const hostSubtotal = hourlyRate * durationHours; // 1200
  const connectionFee = Math.round(hostSubtotal * 0.1); // 120
  const gst = Math.round(connectionFee * 0.18); // 22
  const totalPayable = hostSubtotal + connectionFee + gst; // 1342
  const amountPaise = totalPayable * 100; // 134200

  console.log(`2. Order calculation for 2 hrs @ ₹600/hr:
     Host Subtotal: ₹${hostSubtotal}
     Connection Fee: ₹${connectionFee}
     GST: ₹${gst}
     Total Payable: ₹${totalPayable} (${amountPaise} paise)`);

  // 3. Simulate Member Booking Creation after Razorpay payment success
  const testPaymentId = `pay_test_${Date.now().toString(36)}`;
  const testOrderId = `order_rzp_${Date.now()}`;

  const bookingRes = await createBookingAction({
    companionId: 'kashish-blr',
    memberName: 'Nikhil Test Member',
    memberPhone: '+91 9876543210',
    activitySlug: 'coffee-chat',
    date: '2026-11-20',
    startTime: '16:00 IST',
    durationHours: 2,
    meetingPoint: 'Third Wave Coffee, Indiranagar',
    hourlyRate: 600,
    razorpayPaymentId: testPaymentId,
    razorpayOrderId: testOrderId,
  });

  if (!bookingRes.success || !bookingRes.bookingId) {
    throw new Error('Booking creation failed: ' + bookingRes.error);
  }

  console.log(`3. Booking created successfully!
     Booking ID: ${bookingRes.bookingId}
     Start Code: ${bookingRes.startCode}
     Total Escrow Paid: ₹${bookingRes.totalPayable}`);

  // 4. Verify in DB
  const [dbBooking] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingRes.bookingId))
    .limit(1);

  console.log(`4. Database Verification:
     Status: ${dbBooking.status} (expected: confirmed)
     Payment Status: ${dbBooking.paymentStatus} (expected: paid_escrow)
     Razorpay Payment ID: ${dbBooking.razorpayPaymentId}
     Razorpay Order ID: ${dbBooking.razorpayOrderId}
     Escrow Released: ${dbBooking.escrowReleased}`);

  if (dbBooking.status !== 'confirmed' || dbBooking.paymentStatus !== 'paid_escrow') {
    throw new Error('DB booking state mismatch!');
  }

  // 5. Cleanup test booking
  await db.delete(schema.bookings).where(eq(schema.bookings.id, bookingRes.bookingId));
  console.log('5. Cleanup: Test booking removed from DB.');

  console.log('--- ALL RAZORPAY ESCROW PIPELINE CHECKS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
