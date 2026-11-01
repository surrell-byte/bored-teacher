import { createHash, randomInt } from 'node:crypto';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserRecord } from 'firebase-admin/auth';
import { getFirebaseAdminServices } from '@/lib/firebase-admin';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email-sender';

export const runtime = 'nodejs';

const VERIFICATION_WINDOW_MS = 48 * 60 * 60 * 1000;
const SEND_WINDOW_MS = 15 * 60 * 1000;
const SEND_LIMIT = 3;
const VERIFY_ATTEMPT_LIMIT = 5;

type AdminServices = ReturnType<typeof getFirebaseAdminServices>;

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function authenticateRequest(request: Request): Promise<
  | { services: AdminServices; user: UserRecord }
  | { response: NextResponse }
> {
  const token = getBearerToken(request);
  if (!token) {
    return { response: jsonResponse({ ok: false, error: 'Sign in to continue.' }, 401) };
  }

  let services: AdminServices;
  try {
    services = getFirebaseAdminServices();
  } catch (error) {
    console.error('Firebase Admin is unavailable for email verification.', error);
    return { response: jsonResponse({ ok: false, error: 'Email verification is temporarily unavailable.' }, 503) };
  }

  let uid: string;
  try {
    ({ uid } = await services.auth.verifyIdToken(token));
  } catch {
    return { response: jsonResponse({ ok: false, error: 'Your sign-in has expired. Please sign in again.' }, 401) };
  }

  try {
    const user = await services.auth.getUser(uid);
    if (user.disabled || !user.email) {
      return { response: jsonResponse({ ok: false, error: 'This account cannot verify an email address.' }, 401) };
    }
    return { services, user };
  } catch (error) {
    console.error('Firebase could not load the verification account.', error);
    return { response: jsonResponse({ ok: false, error: 'Email verification is temporarily unavailable.' }, 503) };
  }
}

async function sendCode(services: AdminServices, user: UserRecord) {
  if (!user.email) {
    return jsonResponse({ ok: false, error: 'An email address is required.' }, 400);
  }
  if (user.emailVerified) return jsonResponse({ ok: true, verified: true });

  const email = user.email.trim().toLowerCase();
  const now = Date.now();
  const code = String(randomInt(100000, 1000000));
  const ref = services.firestore.collection('emailVerificationCodes').doc(user.uid);
  const rateLimitId = createHash('sha256').update(email).digest('hex');
  const rateLimitRef = services.firestore.collection('emailVerificationRateLimits').doc(rateLimitId);
  let rateLimited = false;

  await services.firestore.runTransaction(async transaction => {
    const [snapshot, rateLimitSnapshot] = await Promise.all([
      transaction.get(ref),
      transaction.get(rateLimitRef),
    ]);
    const previous = snapshot.data();
    const rateLimit = rateLimitSnapshot.data();
    const previousWindowEndsAt = typeof previous?.sendWindowEndsAt === 'number' ? previous.sendWindowEndsAt : 0;
    const previousSendCount = typeof previous?.sendCount === 'number' ? previous.sendCount : 0;
    const previousEmailWindowEndsAt = typeof rateLimit?.windowEndsAt === 'number' ? rateLimit.windowEndsAt : 0;
    const previousEmailSendCount = typeof rateLimit?.sendCount === 'number' ? rateLimit.sendCount : 0;
    const windowIsActive = previousWindowEndsAt > now;
    const emailWindowIsActive = previousEmailWindowEndsAt > now;

    if (
      (windowIsActive && previousSendCount >= SEND_LIMIT)
      || (emailWindowIsActive && previousEmailSendCount >= SEND_LIMIT)
    ) {
      rateLimited = true;
      return;
    }

    transaction.set(ref, {
      email,
      code,
      expiresAt: now + VERIFICATION_WINDOW_MS,
      attempts: 0,
      sendCount: windowIsActive ? previousSendCount + 1 : 1,
      sendWindowEndsAt: windowIsActive ? previousWindowEndsAt : now + SEND_WINDOW_MS,
    });
    transaction.set(rateLimitRef, {
      sendCount: emailWindowIsActive ? previousEmailSendCount + 1 : 1,
      windowEndsAt: emailWindowIsActive ? previousEmailWindowEndsAt : now + SEND_WINDOW_MS,
    });
  });

  if (rateLimited) {
    return jsonResponse({ ok: false, error: 'Too many verification emails. Please try again later.' }, 429);
  }

  const profile = await services.firestore.collection('users').doc(user.uid).get();
  const profileName = profile.get('name');
  const displayName = typeof profileName === 'string' && profileName.trim()
    ? profileName.trim()
    : user.displayName || 'Player';

  await sendVerificationEmail(email, code, displayName);
  try {
    await sendWelcomeEmail(email, displayName);
  } catch (error) {
    console.error('Welcome email could not be sent.', error);
  }

  return jsonResponse({ ok: true, message: 'Verification code sent.' });
}

async function verifyCode(services: AdminServices, user: UserRecord, submittedCode: string) {
  if (user.emailVerified) {
    await services.firestore.collection('users').doc(user.uid).set({
      emailVerified: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return jsonResponse({ ok: true, verified: true });
  }

  const ref = services.firestore.collection('emailVerificationCodes').doc(user.uid);
  const now = Date.now();
  const outcome = await services.firestore.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return 'missing';

    const stored = snapshot.data();
    if (!stored || stored.email !== user.email?.trim().toLowerCase()) return 'missing';

    const expiresAt = typeof stored.expiresAt === 'number' ? stored.expiresAt : 0;
    if (!expiresAt || expiresAt <= now) {
      transaction.delete(ref);
      return 'expired';
    }

    const attempts = typeof stored.attempts === 'number' ? stored.attempts : 0;
    if (attempts >= VERIFY_ATTEMPT_LIMIT) return 'locked';
    if (stored.code !== submittedCode) {
      transaction.update(ref, { attempts: attempts + 1 });
      return 'incorrect';
    }

    transaction.delete(ref);
    return 'verified';
  });

  if (outcome !== 'verified') {
    const rateLimited = outcome === 'locked';
    const message = outcome === 'expired'
      ? 'Your verification code expired. Please request a new one.'
      : outcome === 'locked'
        ? 'Too many incorrect codes. Please request a new one.'
        : outcome === 'incorrect'
          ? 'Incorrect verification code.'
          : 'No verification code is active. Please request a new one.';
    return jsonResponse({ ok: false, error: message }, rateLimited ? 429 : 400);
  }

  await services.auth.updateUser(user.uid, { emailVerified: true });
  await services.firestore.collection('users').doc(user.uid).set({
    emailVerified: true,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return jsonResponse({ ok: true, verified: true });
}

export async function GET() {
  return jsonResponse({
    ok: true,
    route: 'auth/verify',
    supportedMethods: ['POST'],
    message: 'Email verification is restricted to the signed-in account.',
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid request body.' }, 400);
  }
  if (!isRecord(body) || typeof body.action !== 'string') {
    return jsonResponse({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const authenticated = await authenticateRequest(request);
  if ('response' in authenticated) return authenticated.response;

  try {
    if (body.action === 'send') {
      return await sendCode(authenticated.services, authenticated.user);
    }
    if (body.action === 'verify') {
      if (typeof body.code !== 'string' || !/^\d{6}$/.test(body.code)) {
        return jsonResponse({ ok: false, error: 'Enter the 6-digit verification code.' }, 400);
      }
      return await verifyCode(authenticated.services, authenticated.user, body.code);
    }
    return jsonResponse({ ok: false, error: 'Unknown verification action.' }, 400);
  } catch (error) {
    console.error('Email verification request failed.', error);
    return jsonResponse({ ok: false, error: 'Unable to complete email verification right now.' }, 500);
  }
}
