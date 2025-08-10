import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    };

    cookies().set(options);

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create session', details: error.message }, { status: 401 });
  }
}

export async function DELETE() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ status: 'success' });
  }

  cookies().delete('session');

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    await auth.revokeRefreshTokens(decodedClaims.sub);
  } catch (error) {
    // Session cookie is invalid or expired.
    // This is an expected case, so we can ignore the error.
  }
  
  return NextResponse.json({ status: 'success' });
}
