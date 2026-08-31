import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'auth',
    message: 'Authentication is handled by Firebase on the client for email and username sign-in flows.',
    supportedMethods: ['GET']
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Use the Firebase client auth flow for email or username sign-in, reset, and account creation.'
    },
    { status: 400 }
  );
}
