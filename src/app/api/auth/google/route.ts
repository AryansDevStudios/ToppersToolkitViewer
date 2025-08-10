
import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code not found.' },
      { status: 400 }
    );
  }

  try {
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    if (!redirectUri) {
        throw new Error("Redirect URI is not configured in environment variables.");
    }
      
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
        throw new Error("Failed to get user information from Google.");
    }

    const { sub: uid, email, name, picture } = payload;
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid,
        email,
        name: name || "Google User",
        role: "User",
        provider: "google",
      });
    }

    // This part is tricky without a custom backend to mint tokens.
    // For a pure client-side session management with Firebase,
    // we would typically use signInWithCredential after getting the ID token.
    // However, since we are in a server route, we can't directly sign the user in
    // on the client.
    // The standard approach here is to create a custom token on a secure server
    // and send it back to the client to sign in.
    
    // As we can't mint a custom token here without Firebase Admin SDK,
    // we will redirect the user to the homepage. The client-side `useAuth`
    // hook will then pick up the authentication state change.
    // This is a workaround. A full implementation would use Firebase Admin SDK.

    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Ideally, you'd set a session cookie here after creating one.
    // For now, we rely on Firebase's client-side auth state management.
    // We'll pass the ID token to the client via a temporary cookie or URL param
    // for the client to sign in with. Let's try redirecting.
    
    // Redirect to a specific callback page to handle the sign-in
    const callbackUrl = new URL('/api/auth/callback', request.url);
    callbackUrl.searchParams.set('id_token', tokens.id_token!);
    if (tokens.access_token) {
        callbackUrl.searchParams.set('access_token', tokens.access_token);
    }

    return NextResponse.redirect(callbackUrl);

  } catch (error: any) {
    console.error('Error exchanging authorization code:', error.message);
    return NextResponse.json(
      { error: `Failed to authenticate with Google. Details: ${error.message}` },
      { status: 500 }
    );
  }
}
