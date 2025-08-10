
import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code not found.' },
      { status: 400 }
    );
  }

  try {
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oAuth2Client.getToken(code);
    // Here, you would typically use the tokens to create a session,
    // get user info, and create a user record in your own database.
    // For example:
    // oAuth2Client.setCredentials(tokens);
    // const ticket = await oAuth2Client.verifyIdToken({
    //   idToken: tokens.id_token!,
    //   audience: process.env.GOOGLE_CLIENT_ID,
    // });
    // const payload = ticket.getPayload();
    // const userid = payload?.sub;
    // ... logic to find or create user in your DB and create a session cookie

    // For now, we'll just return the tokens as a confirmation.
    // In a real app, you should not expose tokens to the client directly.
    // You should redirect the user to their profile page with a session cookie.
    
    console.log("Authentication successful, tokens received:", tokens);

    // Redirect user to the homepage after successful login
    const response = NextResponse.redirect(new URL('/', request.url));

    // In a real application, you would set a secure, httpOnly cookie here
    // with a session token you've generated.
    // response.cookies.set('session_token', 'your-generated-session-token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return response;

  } catch (error: any) {
    console.error('Error exchanging authorization code:', error.message);
    return NextResponse.json(
      { error: 'Failed to authenticate with Google.' },
      { status: 500 }
    );
  }
}
