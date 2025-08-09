import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserRole } from '@/lib/data';
import { adminAuth } from '@/lib/firebase-admin';

async function getRoleFromCookie(req: NextRequest): Promise<string | null> {
  const sessionCookie = req.cookies.get('session')?.value || '';
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return await getUserRole(decodedClaims.uid);
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const role = await getRoleFromCookie(request);

    if (role !== 'Admin') {
      // If user is not an admin, redirect them to the login page
      // Or you can show a 'not authorized' page
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
