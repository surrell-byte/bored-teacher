import { NextResponse } from 'next/server';
import { getAvatarGiftOptions } from '@/lib/email-verification';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email-sender';

const GIFT_CHOICES = getAvatarGiftOptions();

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

      if (!email || !code) {
        return NextResponse.json({ ok: false, error: 'Missing email or verification code.' }, { status: 400 });
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
