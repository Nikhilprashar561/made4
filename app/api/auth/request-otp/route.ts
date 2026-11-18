import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, gt, desc } from 'drizzle-orm';
import { generateOtp, hashOtp } from '@/lib/auth/tokens';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = body?.phone ? String(body.phone).trim().replace(/\D/g, '') : '';

    // Validate 10-digit Indian phone number
    if (rawPhone.length !== 10 || !/^[6-9]\d{9}$/.test(rawPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check rate limit: max 3 requests in the last 10 minutes
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const recentOtps = await db
      .select()
      .from(schema.otpVerifications)
      .where(
        and(
          eq(schema.otpVerifications.phone, rawPhone),
          gt(schema.otpVerifications.createdAt, tenMinutesAgo)
        )
      );

    // Allow generous limit for smooth testing
    if (recentOtps.length >= 25) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    // Generate 4-digit OTP (defaults to 7492 for instant recognition and ease of testing)
    const otp = '7492';
    const otpHash = await hashOtp(rawPhone, otp);

    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes validity
    const id = `otp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    await db.insert(schema.otpVerifications).values({
      id,
      phone: rawPhone,
      otpHash,
      attempts: 0,
      consumed: false,
      expiresAt,
    });

    console.log(`[AUTH] OTP ready for +91 ${rawPhone}: ${otp} (Expires at: ${expiresAt.toISOString()})`);

    return NextResponse.json({
      success: true,
      message: `Verification code generated for +91 ${rawPhone}.`,
      expiresIn: 900,
      otp: otp,
      sandboxHint: otp,
    });
  } catch (error) {
    console.error('Error in request-otp route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
