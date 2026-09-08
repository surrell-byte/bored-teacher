import { NextResponse } from 'next/server';
import { getAvatarGiftOptions } from '@/lib/email-verification';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email-sender';

const GIFT_CHOICES = getAvatarGiftOptions();
const SEND_WINDOW_MS = 15 * 60 * 1000;
const SEND_LIMIT = 3;
const sendAttempts = new Map<string, { count: number; resetAt: number }>();

function getRequestKey(req: Request, email: string) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return `${forwardedFor || 'unknown'}:${email}`;
}

function canSendVerification(req: Request, email: string) {
  const now = Date.now();
  const key = getRequestKey(req, email);
  const previous = sendAttempts.get(key);
  if (!previous || previous.resetAt <= now) {
    sendAttempts.set(key, { count: 1, resetAt: now + SEND_WINDOW_MS });
    return true;
  }
  if (previous.count >= SEND_LIMIT) return false;
  previous.count += 1;
  return true;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'auth/verify',
    supportedMethods: ['POST'],
    message: 'Email verification and welcome gift flows are handled here.'
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body?.action || '').trim();

    if (action === 'send') {
      const email = String(body?.email || '').trim().toLowerCase();
      const displayName = String(body?.displayName || 'Player').trim();
      const code = String(body?.code || '').trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
        return NextResponse.json({ ok: false, error: 'Missing email or verification code.' }, { status: 400 });
      }
      if (!canSendVerification(req, email)) {
        return NextResponse.json({ ok: false, error: 'Too many verification emails. Please try again later.' }, { status: 429 });
      }

      await sendVerificationEmail(email, code, displayName || 'Player');
      try {
        await sendWelcomeEmail(email, displayName || 'Player');
      } catch {}
      return NextResponse.json({ ok: true, message: 'Verification code sent.' });
    }

    if (action === 'verify') {
      return NextResponse.json({ ok: false, error: 'Verification is completed in the authenticated client.' }, { status: 400 });
    }

    if (action === 'claim-gift') {
      const uid = String(body?.uid || '').trim();
      const giftId = String(body?.giftId || '').trim();
      if (!uid || !giftId) {
        return NextResponse.json({ ok: false, error: 'Missing gift selection.' }, { status: 400 });
      }

      const item = GIFT_CHOICES.find(choice => choice.id === giftId);
      if (!item) {
        return NextResponse.json({ ok: false, error: 'That avatar is not available.' }, { status: 400 });
      }

      return NextResponse.json({ ok: true, giftClaimed: true, avatar: item.emoji });
    }

    return NextResponse.json({ ok: false, error: 'Unknown verification action.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to complete the request.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
