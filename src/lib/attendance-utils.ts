/**
 * Attendance Token Utility (HMAC-signed)
 * Format: pb_attr:{courseId}:{dateStr}:{nonce}:{signature}
 * The signature is HMAC-SHA256 of "{courseId}:{dateStr}:{nonce}" using ATTENDANCE_TOKEN_SECRET.
 * Tokens are only valid for today's date.
 */

export const ATTENDANCE_TOKEN_PREFIX = 'pb_attr';

/**
 * Generate a signed attendance token (server-only).
 * Must be called from a Server Action or Server Component.
 */
export async function generateAttendanceToken(courseId: string): Promise<string> {
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const nonce = crypto.randomUUID().slice(0, 8);
  const payload = `${courseId}:${dateStr}:${nonce}`;
  const signature = await hmacSign(payload);
  return `${ATTENDANCE_TOKEN_PREFIX}:${payload}:${signature}`;
}

/**
 * Verify a signed attendance token (server-only).
 * Returns courseId if valid, null otherwise.
 */
export async function verifyAttendanceToken(token: string): Promise<{ courseId: string; dateStr: string } | null> {
  if (!token.startsWith(ATTENDANCE_TOKEN_PREFIX + ':')) return null;

  const parts = token.split(':');
  // Format: pb_attr : courseId : dateStr : nonce : signature
  if (parts.length !== 5) return null;

  const [, courseId, dateStr, nonce, signature] = parts;

  // Verify date is today
  const today = new Date().toISOString().split('T')[0];
  if (dateStr !== today) return null;

  // Verify HMAC signature
  const payload = `${courseId}:${dateStr}:${nonce}`;
  const expectedSignature = await hmacSign(payload);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  return { courseId, dateStr };
}

async function hmacSign(payload: string): Promise<string> {
  const secret = process.env.ATTENDANCE_TOKEN_SECRET;
  if (!secret) {
    throw new Error('ATTENDANCE_TOKEN_SECRET environment variable is not set');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  // Return hex string
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
