import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken, TokenPayload } from './tokens';

export const ACCESS_TOKEN_COOKIE = 'togethr_access_token';
export const REFRESH_TOKEN_COOKIE = 'togethr_refresh_token';

// 15 minutes for access token
export const ACCESS_TOKEN_MAX_AGE = 15 * 60;
// 30 days for refresh token
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Set authentication cookies on a NextResponse
 */
export function setAuthCookies<T = any>(
  res: NextResponse<T>,
  accessToken: string,
  refreshToken: string
): NextResponse<T> {
  res.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  res.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return res;
}

/**
 * Clear authentication cookies on a NextResponse
 */
export function clearAuthCookies<T = any>(res: NextResponse<T>): NextResponse<T> {
  res.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  res.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return res;
}

/**
 * Read current session from cookies in a Server Component or Server Action
 */
export async function getSessionFromCookies(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;
  return await verifyAccessToken(token);
}
