import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'games',
    message: 'Game catalog metadata should be sourced from the canonical game registry and validated before returning.',
    supportedMethods: ['GET']
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Game writes should not be exposed publicly. Use the authenticated application flow for any mutating actions.'
    },
    { status: 405 }
  );
}
