import crypto from 'crypto';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { createBookingAction } from '../app/actions/booking';

async function runTest() {
  console.log('--- STARTING LIVE RAZORPAY ESCROW PIPELINE TEST ---');

  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_U1vsGZmAmrlbUN';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'hCp7xKuLQH43rSuYa9QyWPk9';

  console.log('1. Active Razorpay Key ID:', keyId);

  // 2. Compute pricing breakdown
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

  // 3. Create real order on Razorpay's API
  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_live_${Date.now()}`,
      notes: {
        platform: 'made4togethr',
        mode: 'automated_test',
      },
    }),
  });

  if (!rzpRes.ok) {
    const errText = await rzpRes.text();
    throw new Error(`Razorpay API call failed with status ${rzpRes.status}: ${errText}`);
  }

  const rzpOrder = await rzpRes.json();
  console.log(`3. Real Razorpay Order Created on Razorpay servers:
     Order ID: ${rzpOrder.id}
     Status: ${rzpOrder.status}
     Amount: ₹${rzpOrder.amount / 100}`);

  // 4. Simulate payment and cryptographic signature
  const testPaymentId = `pay_live_test_${Date.now().toString(36)}`;
  const signature = crypto
    .createHmac('sha256', keySecret)
    .update(`${rzpOrder.id}|${testPaymentId}`)
    .digest('hex');

  console.log(`4. Generated HMAC-SHA256 signature: ${signature.slice(0, 16)}...`);

  // 5. Confirm booking in Neon DB
  const bookingRes = await createBookingAction({
    companionId: 'kashish-blr',
    memberName: 'Nikhil Live Verified Member',
    memberPhone: '+91 9876543210',
    activitySlug: 'coffee-chat',
    date: '2026-11-20',
    startTime: '16:00 IST',
    durationHours: 2,
    meetingPoint: 'Third Wave Coffee, Indiranagar',
    hourlyRate: 600,
    razorpayPaymentId: testPaymentId,
    razorpayOrderId: rzpOrder.id,
    razorpaySignature: signature,
  });

  if (!bookingRes.success || !bookingRes.bookingId) {
    throw new Error('Booking creation failed: ' + bookingRes.error);
  }

  console.log(`5. Booking confirmed in DB:
     Booking ID: ${bookingRes.bookingId}
     Start Code: ${bookingRes.startCode}
     Total Escrow Locked: ₹${bookingRes.totalPayable}`);

  // 6. Verify in DB
  const [dbBooking] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingRes.bookingId))
    .limit(1);

  console.log(`6. DB Verification:
     Status: ${dbBooking.status} (expected: confirmed)
     Payment Status: ${dbBooking.paymentStatus} (expected: paid_escrow)
     Razorpay Payment ID: ${dbBooking.razorpayPaymentId}
     Razorpay Order ID: ${dbBooking.razorpayOrderId}
     Escrow Released: ${dbBooking.escrowReleased}`);

  if (dbBooking.status !== 'confirmed' || dbBooking.paymentStatus !== 'paid_escrow') {
    throw new Error('DB booking state mismatch!');
  }

  // 7. Cleanup test booking
  await db.delete(schema.bookings).where(eq(schema.bookings.id, bookingRes.bookingId));
  console.log('7. Cleanup: Test booking removed from DB.');

  console.log('--- ALL LIVE RAZORPAY VERIFICATION CHECKS PASSED WITH FLYING COLORS! ---');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
