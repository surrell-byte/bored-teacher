import { NextResponse } from 'next/server';
import { getFirebaseAdminServices } from '@/lib/firebase-admin';
import { sendSupportQuestionEmail, sendSupportReceiptEmail } from '@/lib/email-sender';

export const runtime = 'nodejs';

const SUPPORT_EMAIL_WINDOW_MS = 60 * 60 * 1000;
const SUPPORT_EMAIL_LIMIT = 5;

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFeedbackType(value: unknown): value is 'suggestion' | 'grievance' {
  return value === 'suggestion' || value === 'grievance';
}

function hasSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ ok: false, error: 'Cross-origin support requests are not allowed.' }, 403);
  }

  const tokenMatch = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return jsonResponse({ ok: false, error: 'Sign in to contact support.' }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid request body.' }, 400);
  }
  const message = isRecord(body) && typeof body.message === 'string' ? body.message.trim() : '';
  const type = isRecord(body) && isFeedbackType(body.type)
    ? body.type
    : null;
  const page = isRecord(body) ? body.page : undefined;
  if (
    !message
    || message.length > 2000
    || !type
    || typeof page !== 'string'
    || !page.startsWith('/')
    || page.length > 200
  ) {
    return jsonResponse({ ok: false, error: 'Enter a message of up to 2,000 characters.' }, 400);
  }

  try {
    const services = getFirebaseAdminServices();
    const decoded = await services.auth.verifyIdToken(tokenMatch[1]);
    const user = await services.auth.getUser(decoded.uid);
    if (user.disabled || !user.email) {
      return jsonResponse({ ok: false, error: 'This account cannot contact support.' }, 401);
    }

    const now = Date.now();
    const rateLimitRef = services.firestore.collection('supportEmailRateLimits').doc(user.uid);
    let rateLimited = false;
    await services.firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(rateLimitRef);
      const previous = snapshot.data();
      const windowEndsAt = typeof previous?.windowEndsAt === 'number' ? previous.windowEndsAt : 0;
      const sendCount = typeof previous?.sendCount === 'number' ? previous.sendCount : 0;
      const windowIsActive = windowEndsAt > now;
      if (windowIsActive && sendCount >= SUPPORT_EMAIL_LIMIT) {
        rateLimited = true;
        return;
      }
      transaction.set(rateLimitRef, {
        sendCount: windowIsActive ? sendCount + 1 : 1,
        windowEndsAt: windowIsActive ? windowEndsAt : now + SUPPORT_EMAIL_WINDOW_MS,
      });
    });
    if (rateLimited) {
      return jsonResponse({ ok: false, error: 'You have sent several support messages recently. Please try again later.' }, 429);
    }

    const profile = await services.firestore.collection('users').doc(user.uid).get();
    const profileName = profile.get('name');
    const name = typeof profileName === 'string' && profileName.trim()
      ? profileName.trim()
      : user.displayName || 'Player';
    const details = {
      message,
      type,
      page,
      name,
      email: user.email,
    };

    await sendSupportQuestionEmail(details);
    let receiptSent = true;
    try {
      await sendSupportReceiptEmail(user.email, details);
    } catch (error) {
      receiptSent = false;
      console.error('Support receipt email could not be sent.', error);
    }

    return jsonResponse({ ok: true, receiptSent });
  } catch (error) {
    console.error('Support email could not be sent.', error);
    return jsonResponse({ ok: false, error: 'Your message was saved, but support email delivery is temporarily unavailable.' }, 503);
  }
}
