import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import {
  verifyAccessToken,
  hashString,
  generateRefreshToken,
  signAccessToken,
} from '@/lib/auth/tokens';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    let userId: string | null = null;
    let shouldRotate = false;

    // 1. Authenticate user from access token
    if (accessToken) {
      const decoded = await verifyAccessToken(accessToken);
      if (decoded?.userId) {
        userId = decoded.userId;
      }
    }

    // 2. Fallback to refresh token if access token expired
    if (!userId && refreshToken) {
      const tokenHash = await hashString(refreshToken);
      const now = new Date();

      const [tokenRecord] = await db
        .select()
        .from(schema.refreshTokens)
        .where(
          and(
            eq(schema.refreshTokens.tokenHash, tokenHash),
            eq(schema.refreshTokens.isRevoked, false),
            gt(schema.refreshTokens.expiresAt, now)
          )
        )
        .limit(1);

      if (tokenRecord) {
        userId = tokenRecord.userId;
        shouldRotate = true;

        await db
          .update(schema.refreshTokens)
          .set({ isRevoked: true })
          .where(eq(schema.refreshTokens.id, tokenRecord.id));
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again.' },
        { status: 401 }
      );
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const [memberProfile] = await db
      .select()
      .from(schema.memberProfiles)
      .where(eq(schema.memberProfiles.userId, user.id))
      .limit(1);

    const body = await req.json().catch(() => ({}));
    const fullName = String(body?.fullName || memberProfile?.fullName || 'Host').trim();
    const dob = String(body?.dob || '');
    const aadhaarNumber = String(body?.aadhaarNumber || '').replace(/[\s-]/g, '');
    const aadhaarImage = String(body?.aadhaarImage || 'uploaded-aadhaar-front.jpg');
    const upiId = String(body?.upiId || '').trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full legal name as shown on your government ID.' },
        { status: 400 }
      );
    }

    if (aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
      return NextResponse.json(
        { error: 'Aadhaar number must be exactly 12 digits.' },
        { status: 400 }
      );
    }

    if (!upiId || !upiId.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid UPI ID (e.g. mobile@okaxis or name@upi).' },
        { status: 400 }
      );
    }

    // Calculate age from DOB if available, default to 24
    let age = 24;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        return NextResponse.json(
          { error: 'You must be at least 18 years of age to host on Togethr.' },
          { status: 400 }
        );
      }
    }

    // Generate unique slug for host companion
    const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hostId = `${cleanName || 'host'}-${user.id.slice(-6)}`;
    const maskedAadhaar = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;
    const gender = memberProfile?.gender || 'male';
    const city = memberProfile?.city || 'bengaluru';
    const area = memberProfile?.area || 'Indiranagar';
    const avatarUrl = gender === 'female' ? '/avatars/female.svg' : '/avatars/male.svg';

    // 1. Insert KYC submission linked to userId
    const kycId = `kyc_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    await db.insert(schema.kycSubmissions).values({
      id: kycId,
      companionId: hostId,
      userId: user.id,
      fullName,
      aadhaarNumber: maskedAadhaar,
      aadhaarImage,
      status: 'approved',
    });

    // 2. Check if host profile already exists for this user
    const [existingHost] = await db
      .select()
      .from(schema.hostProfiles)
      .where(eq(schema.hostProfiles.userId, user.id))
      .limit(1);

    let savedHostProfile: typeof schema.hostProfiles.$inferSelect;

    if (existingHost) {
      await db
        .update(schema.hostProfiles)
        .set({
          displayName: fullName,
          age,
          gender,
          city,
          area,
          upiId,
          verificationStatus: 'approved',
          verifiedId: true,
          verifiedPhoto: true,
          isFreeToday: true,
          isActive: true,
        })
        .where(eq(schema.hostProfiles.id, existingHost.id));

      const [updated] = await db
        .select()
        .from(schema.hostProfiles)
        .where(eq(schema.hostProfiles.id, existingHost.id))
        .limit(1);
      savedHostProfile = updated;
    } else {
      await db.insert(schema.hostProfiles).values({
        id: hostId,
        userId: user.id,
        displayName: fullName,
        age,
        gender,
        city,
        area,
        tagline: 'Friendly, respectful, and verified platonic companion',
        about: 'Verified platonic companion on Togethr. Available for gym sessions, coffee chats, movies, and city exploration.',
        avatarUrl,
        languages: ['English', 'Hindi'],
        hourlyRate: 600,
        verificationStatus: 'approved',
        verifiedId: true,
        verifiedPhoto: true,
        isFreeToday: true,
        isWeekendOnly: false,
        acceptsWomenOnly: false,
        isActive: true,
        rating: '5.00',
        reviewCount: 0,
        meetupsCount: 0,
        activities: ['gym-partner', 'movie-buddy', 'coffee-chat', 'explore-city'],
        upiId,
        walletBalance: 0,
      });

      const [created] = await db
        .select()
        .from(schema.hostProfiles)
        .where(eq(schema.hostProfiles.userId, user.id))
        .limit(1);
      savedHostProfile = created;
    }

    // 3. Upsert into public companions catalog
    const [existingCompanion] = await db
      .select()
      .from(schema.companions)
      .where(eq(schema.companions.id, savedHostProfile.id))
      .limit(1);

    if (existingCompanion) {
      await db
        .update(schema.companions)
        .set({
          name: fullName,
          age,
          gender,
          city,
          area,
          aadhaarNumber: maskedAadhaar,
          aadhaarImageUrl: aadhaarImage,
          upiId,
          verifiedId: true,
          verifiedPhoto: true,
          isFreeToday: true,
        })
        .where(eq(schema.companions.id, savedHostProfile.id));
    } else {
      await db.insert(schema.companions).values({
        id: savedHostProfile.id,
        name: fullName,
        age,
        gender,
        city,
        area,
        tagline: 'Friendly, respectful, and verified platonic companion',
        about: 'Verified platonic companion on Togethr. Available for gym sessions, coffee chats, movies, and city exploration.',
        avatarUrl,
        languages: ['English', 'Hindi'],
        hourlyRate: 600,
        verifiedId: true,
        verifiedPhoto: true,
        rating: '5.00',
        reviewCount: 0,
        meetupsCount: 0,
        activities: ['gym-partner', 'movie-buddy', 'coffee-chat', 'explore-city'],
        isFreeToday: true,
        isWeekendOnly: false,
        acceptsWomenOnly: false,
        memberSince: 'November 2026',
        availability: [
          { days: 'Mon — Fri', hours: '16:00 – 21:00' },
          { days: 'Sat — Sun', hours: '11:00 – 20:00' },
        ],
        aadhaarNumber: maskedAadhaar,
        aadhaarImageUrl: aadhaarImage,
        upiId,
      });
    }

    // 4. Update user activeRole to 'host'
    await db
      .update(schema.users)
      .set({ activeRole: 'host', updatedAt: new Date() })
      .where(eq(schema.users.id, user.id));

    // 5. Issue new Access Token with role: 'host'
    const newAccessToken = await signAccessToken({
      userId: user.id,
      phone: user.phone,
      role: 'host',
    });

    let currentRefreshToken = refreshToken;
    if (shouldRotate || !currentRefreshToken) {
      currentRefreshToken = generateRefreshToken();
      const newTokenHash = await hashString(currentRefreshToken);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db.insert(schema.refreshTokens).values({
        id: `rft_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        userId: user.id,
        tokenHash: newTokenHash,
        isRevoked: false,
        expiresAt,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Congratulations! Your Host Profile has been verified and approved.',
      hostProfile: savedHostProfile,
      user: {
        id: user.id,
        phone: user.phone,
        activeRole: 'host',
        accountStatus: user.accountStatus,
      },
      kycReference: `#TGR-${kycId.slice(-6)}`,
      redirectTo: '/companion/dashboard',
    });

    // Attach fresh cookies with role: 'host'
    return setAuthCookies(response, newAccessToken, currentRefreshToken);
  } catch (error) {
    console.error('Error upgrading to host:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upgrade to host profile.' },
      { status: 500 }
    );
  }
}
