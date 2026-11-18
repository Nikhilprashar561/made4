import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './lib/auth/tokens';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './lib/auth/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected route definitions
  const isProtectedHostRoute = pathname.startsWith('/companion/dashboard');
  const isProtectedMemberRoute =
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/onboarding/member') ||
    pathname.startsWith('/companion/kyc');

  if (!isProtectedHostRoute && !isProtectedMemberRoute) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // If neither token is present, redirect to login
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If access token is valid, check role permissions
  if (accessToken) {
    const decoded = await verifyAccessToken(accessToken);
    if (decoded?.userId) {
      if (isProtectedHostRoute && decoded.role !== 'host') {
        // If user is a member attempting to access host dashboard without approved host role,
        // redirect them to the become a companion onboarding
        return NextResponse.redirect(new URL('/become-a-companion', req.url));
      }
      return NextResponse.next();
    }
  }

  // If access token was expired but refresh token exists, allow through so client/me can rotate
  if (refreshToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/companion/dashboard/:path*',
    '/companion/kyc/:path*',
    '/bookings/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
  ],
};
