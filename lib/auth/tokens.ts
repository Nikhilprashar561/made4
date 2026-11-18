import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.AUTH_JWT_SECRET || 'made4togethr_super_secret_jwt_key_2026_secured_production_only';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface TokenPayload {
  userId: string;
  phone: string;
  role: 'member' | 'host' | 'admin';
}

/**
 * Sign a short-lived 15-minute access token using Jose
 */
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      phone: payload.phone as string,
      role: payload.role as 'member' | 'host' | 'admin',
    };
  } catch {
    return null;
  }
}

/**
 * Generate a cryptographically secure random refresh token string
 */
export function generateRefreshToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compute SHA-256 hash using Web Crypto API
 */
export async function hashString(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute SHA-256 hash for OTP validation bound to a phone number
 */
export async function hashOtp(phone: string, otp: string): Promise<string> {
  const salt = process.env.OTP_SALT || 'togethr_otp_salt_9891';
  return await hashString(`${phone}:${otp}:${salt}`);
}

/**
 * Generate a 4-digit numeric OTP (e.g. 7492)
 */
export function generateOtp(): string {
  // If sandbox mode is true, or in dev, generate 4-digit code (e.g. 7492)
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = (1000 + (array[0] % 9000)).toString();
  return code;
}
