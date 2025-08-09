import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

// 7 days
const expiresIn = 60 * 60 * 24 * 7 * 1000;

export async function POST(request: Request) {
  const { token } = await request.json();

  try {
    const sessionCookie = await auth.createSessionCookie(token, { expiresIn });
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    };

    const response = NextResponse.json({}, { status: 200 });
    response.cookies.set(options);
    return response;

  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create session', details: error.message }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
    const options = {
      name: 'session',
      value: '',
      maxAge: -1,
    };
    const response = NextResponse.json({}, { status: 200 });
    response.cookies.set(options);
    return response;
}
