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

/**
 * Helper to authenticate user via Access Token or silent Refresh Token
 */
async function authenticateRequest(req: NextRequest): Promise<{
  userId: string;
  phone: string;
  role: 'member' | 'host' | 'admin';
  newTokens?: { accessToken: string; refreshToken: string };
} | null> {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let userId: string | null = null;
  let shouldRotate = false;

  // 1. Try access token
  if (accessToken) {
    const decoded = await verifyAccessToken(accessToken);
    if (decoded?.userId) {
      userId = decoded.userId;
    }
  }

  // 2. Fall back to refresh token if access token is missing/expired
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

      // Revoke the old refresh token
      await db
        .update(schema.refreshTokens)
        .set({ isRevoked: true })
        .where(eq(schema.refreshTokens.id, tokenRecord.id));
    }
  }

  if (!userId) return null;

  // Verify active user
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user || user.accountStatus !== 'active') return null;

  let newTokens: { accessToken: string; refreshToken: string } | undefined;
  if (shouldRotate) {
    const newAccessToken = await signAccessToken({
      userId: user.id,
      phone: user.phone,
      role: user.activeRole as any,
    });
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = await hashString(newRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(schema.refreshTokens).values({
      id: `rft_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.id,
      tokenHash: newTokenHash,
      isRevoked: false,
      expiresAt,
    });

    newTokens = { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  return {
    userId: user.id,
    phone: user.phone,
    role: user.activeRole as any,
    newTokens,
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again.' },
        { status: 401 }
      );
    }

    const [profile] = await db
      .select()
      .from(schema.memberProfiles)
      .where(eq(schema.memberProfiles.userId, auth.userId))
      .limit(1);

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, auth.userId))
      .limit(1);

    let res = NextResponse.json({
      success: true,
      user: user || null,
      memberProfile: profile || null,
    });

    if (auth.newTokens) {
      res = setAuthCookies(res, auth.newTokens.accessToken, auth.newTokens.refreshToken);
    }

    return res;
  } catch (error) {
    console.error('Error in GET member-profile:', error);
    return NextResponse.json(
      { error: 'Unable to load profile at this moment. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again with your phone number.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const fullName = String(body?.fullName || '').trim();
    const gender = body?.gender === 'male' ? 'male' : 'female';
    const city = String(body?.city || 'bengaluru').trim();
    const area = String(body?.area || '').trim();
    const bio = String(body?.bio || '').trim();
    const emergencyContact = String(body?.emergencyContact || '').trim().replace(/\D/g, '');

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (emergencyContact && emergencyContact.length !== 10) {
      return NextResponse.json(
        { error: 'Emergency contact number must be exactly 10 digits.' },
        { status: 400 }
      );
    }

    // Update or insert member profile
    const [existing] = await db
      .select()
      .from(schema.memberProfiles)
      .where(eq(schema.memberProfiles.userId, auth.userId))
      .limit(1);

    if (existing) {
      await db
        .update(schema.memberProfiles)
        .set({
          fullName,
          gender,
          city,
          area: area || null,
          bio: bio || null,
          emergencyContact: emergencyContact || null,
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.memberProfiles.id, existing.id));
    } else {
      await db.insert(schema.memberProfiles).values({
        id: `mem_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        userId: auth.userId,
        fullName,
        gender,
        city,
        area: area || null,
        bio: bio || null,
        emergencyContact: emergencyContact || null,
        onboardingCompleted: true,
      });
    }

    const [updatedProfile] = await db
      .select()
      .from(schema.memberProfiles)
      .where(eq(schema.memberProfiles.userId, auth.userId))
      .limit(1);

    let res = NextResponse.json({
      success: true,
      message: 'Profile saved successfully!',
      memberProfile: updatedProfile,
    });

    if (auth.newTokens) {
      res = setAuthCookies(res, auth.newTokens.accessToken, auth.newTokens.refreshToken);
    }

    return res;
  } catch (error) {
    console.error('Error in member-profile update:', error);
    return NextResponse.json(
      { error: 'Unable to save your profile right now. Please try again.' },
      { status: 500 }
    );
  }
}
