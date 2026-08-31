import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'resources',
    message: 'Resource metadata should be published from the approved content catalog with role-based access controls.',
    supportedMethods: ['GET']
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Resource writes require creator permissions and server-side validation.'
    },
    { status: 403 }
  );
}
