import { SignJWT, jwtVerify } from 'jose';

export function getAdminSecretBytes(): Uint8Array | null {
  const s = process.env.ADMIN_SECRET?.trim();
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

export async function signAdminSessionToken(): Promise<string | null> {
  const secret = getAdminSecretBytes();
  if (!secret) return null;
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  const secret = getAdminSecretBytes();
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
