import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashString } from '@/lib/auth/tokens';
import { REFRESH_TOKEN_COOKIE, clearAuthCookies } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      const tokenHash = await hashString(refreshToken);
      await db
        .update(schema.refreshTokens)
        .set({ isRevoked: true })
        .where(eq(schema.refreshTokens.tokenHash, tokenHash));
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    return clearAuthCookies(response);
  } catch (error) {
    console.error('Error in /api/auth/logout:', error);
    const response = NextResponse.json({ success: true });
    return clearAuthCookies(response);
  }
}
