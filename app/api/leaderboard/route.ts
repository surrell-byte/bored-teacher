import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'leaderboard',
    message: 'Leaderboard data should be read from the canonical score store and filtered by the current game context.',
    supportedMethods: ['GET']
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Score updates must be validated before writing to the leaderboard store.'
    },
    { status: 405 }
  );
}
