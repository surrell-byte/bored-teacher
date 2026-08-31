import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'profile',
    message: 'Profile reads require an authenticated user session and should only expose the caller\'s own record.',
    supportedMethods: ['GET']
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Profile updates must be validated and scoped to the authenticated user.'
    },
    { status: 405 }
  );
}
