
import 'server-only';
import { cookies } from 'next/headers';
import { auth } from './firebase-admin';
import { getUserById } from './data';
import type { User } from './types';

export async function getUser(): Promise<User | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedClaims = await auth?.verifySessionCookie(sessionCookie, true);
        if (!decodedClaims) {
            return null;
        }
        return await getUserById(decodedClaims.uid);
    } catch (error) {
        // Session cookie is invalid or expired.
        // The client-side auth state will handle cleanup.
        return null;
    }
}
