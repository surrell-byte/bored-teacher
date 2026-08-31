import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'statistics',
    message: 'Stats endpoints should aggregate from the canonical analytics store and respect role-based access controls.',
    supportedMethods: ['GET']
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Statistics writes should not be exposed publicly; only validated backend services should write to analytics.'
    },
    { status: 405 }
  );
}
