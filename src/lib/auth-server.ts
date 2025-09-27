
import 'server-only';
import { cookies } from 'next/headers';
import { auth } from './firebase-admin';
import { getUserById } from './data';
import type { User } from './types';

export async function getUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth?.verifySessionCookie(sessionCookie, true);
    if (!decodedClaims) return null;
    const user = await getUserById(decodedClaims.uid);
    return user;
  } catch (error) {
    // This is expected if the cookie is invalid or expired.
    // console.error("Auth server error:", error); // Optional: log for debugging
    return null;
  }
}
