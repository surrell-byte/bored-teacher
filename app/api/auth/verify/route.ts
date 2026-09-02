import { NextResponse } from 'next/server';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateVerificationCode, getAvatarGiftOptions } from '@/lib/email-verification';
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

    if (!db) {
      return NextResponse.json({ ok: false, error: 'Firebase is not configured.' }, { status: 500 });
    }

    if (action === 'send') {
      const email = String(body?.email || '').trim().toLowerCase();
      const displayName = String(body?.displayName || 'Player').trim();
      const uid = String(body?.uid || '').trim();

      if (!email || !uid) {
        return NextResponse.json({ ok: false, error: 'Missing email or user id.' }, { status: 400 });
      }

      const code = generateVerificationCode();
      const userRef = doc(db, 'users', uid);
      const existing = await getDoc(userRef);
      if (!existing.exists()) {
        return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 });
      }

      await setDoc(userRef, {
        email: email.toLowerCase(),
        emailVerificationCode: code,
        emailVerificationSentAt: Date.now(),
        emailVerified: false,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await sendVerificationEmail(email, code, displayName || 'Player');
      try {
        await sendWelcomeEmail(email, displayName || 'Player');
      } catch {}
      return NextResponse.json({ ok: true, message: 'Verification code sent.' });
    }

    if (action === 'verify') {
      const uid = String(body?.uid || '').trim();
      const code = String(body?.code || '').trim();
      if (!uid || !code) {
        return NextResponse.json({ ok: false, error: 'Missing verification details.' }, { status: 400 });
      }

      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) {
        return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 });
      }

      const data = snapshot.data() as Record<string, unknown>;
      const savedCode = String(data.emailVerificationCode || '').trim();
      const sentAt = typeof data.emailVerificationSentAt === 'number'
        ? data.emailVerificationSentAt
        : typeof data.emailVerificationSentAt === 'string'
          ? Number(data.emailVerificationSentAt)
          : 0;

      if (!savedCode || !sentAt) {
        return NextResponse.json({ ok: false, error: 'No verification code is active for this account.' }, { status: 400 });
      }

      const elapsed = Date.now() - sentAt;
      if (elapsed > 48 * 60 * 60 * 1000) {
        return NextResponse.json({ ok: false, error: 'Your verification code expired. Please request a new one.' }, { status: 410 });
      }

      if (savedCode !== code) {
        return NextResponse.json({ ok: false, error: 'Incorrect verification code.' }, { status: 400 });
      }

      await setDoc(userRef, {
        emailVerified: true,
        emailVerificationCode: '',
        emailVerificationSentAt: Date.now(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return NextResponse.json({
        ok: true,
        verified: true,
        needsGiftSelection: !Boolean(data.welcomeGiftClaimed),
        giftChoices: GIFT_CHOICES,
      });
    }

    if (action === 'claim-gift') {
      const uid = String(body?.uid || '').trim();
      const giftId = String(body?.giftId || '').trim();
      if (!uid || !giftId) {
        return NextResponse.json({ ok: false, error: 'Missing gift selection.' }, { status: 400 });
      }

      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) {
        return NextResponse.json({ ok: false, error: 'Account not found.' }, { status: 404 });
      }

      const data = snapshot.data() as Record<string, unknown>;
      const item = GIFT_CHOICES.find(choice => choice.id === giftId);
      if (!item) {
        return NextResponse.json({ ok: false, error: 'That avatar is not available.' }, { status: 400 });
      }

      const ownedItems = Array.isArray(data.ownedItems) ? data.ownedItems as string[] : [];
      const mergedItems = Array.from(new Set([...ownedItems, giftId]));

      await setDoc(userRef, {
        avatar: item.emoji,
        ownedItems: mergedItems,
        welcomeGiftClaimed: true,
        welcomeGiftId: giftId,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return NextResponse.json({ ok: true, giftClaimed: true, avatar: item.emoji });
    }

    return NextResponse.json({ ok: false, error: 'Unknown verification action.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to complete the request.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
