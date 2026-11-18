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
  clearAuthCookies,
} from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    let userId: string | null = null;
    let shouldRotate = false;

    // 1. Try validating access token
    if (accessToken) {
      const decoded = await verifyAccessToken(accessToken);
      if (decoded?.userId) {
        userId = decoded.userId;
      }
    }

    // 2. If access token expired or invalid, attempt silent refresh using refresh token
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

        // Revoke the used refresh token (Rotation)
        await db
          .update(schema.refreshTokens)
          .set({ isRevoked: true })
          .where(eq(schema.refreshTokens.id, tokenRecord.id));
      }
    }

    // 3. If still unauthenticated, return clean unauthenticated payload
    if (!userId) {
      const unauthResponse = NextResponse.json({
        isAuthenticated: false,
        user: null,
        memberProfile: null,
        hostProfile: null,
      });
      return clearAuthCookies(unauthResponse);
    }

    // 4. Fetch full user & profiles
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user || user.accountStatus !== 'active') {
      const resp = NextResponse.json({
        isAuthenticated: false,
        user: null,
        memberProfile: null,
        hostProfile: null,
      });
      return clearAuthCookies(resp);
    }

    const [memberProfile] = await db
      .select()
      .from(schema.memberProfiles)
      .where(eq(schema.memberProfiles.userId, user.id))
      .limit(1);

    const [hostProfile] = await db
      .select()
      .from(schema.hostProfiles)
      .where(eq(schema.hostProfiles.userId, user.id))
      .limit(1);

    const response = NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        phone: user.phone,
        activeRole: user.activeRole,
        accountStatus: user.accountStatus,
      },
      memberProfile: memberProfile || null,
      hostProfile: hostProfile || null,
    });

    // If refreshed, issue new cookie pair
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

      return setAuthCookies(response, newAccessToken, newRefreshToken);
    }

    return response;
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
      memberProfile: null,
      hostProfile: null,
    });
  }
}
