import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'admin',
    policy: {
      publicMetadata: true,
      requiresAuth: true,
      creatorOnly: true,
      allowedEmails: ['boredteacherapp@gmail.com'],
      serverValidationRequired: true,
      mutatingActionsDenied: true,
    },
    message: 'Admin and creator endpoints require an authenticated creator session before returning protected data.',
    supportedMethods: ['GET']
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Creator-only actions must be issued from an authenticated session and validated server-side before execution.',
      reason: 'creator_only_required',
      allowedEmails: ['boredteacherapp@gmail.com']
    },
    { status: 403 }
  );
}
