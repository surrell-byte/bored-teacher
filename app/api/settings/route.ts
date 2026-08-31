import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'settings',
    message: 'User settings must be read from the authenticated user\'s own record and never from anonymous requests.',
    supportedMethods: ['GET']
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Settings mutations require the authenticated user identity and validation of the incoming payload.'
    },
    { status: 405 }
  );
}
