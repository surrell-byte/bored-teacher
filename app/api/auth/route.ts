import { NextResponse } from 'next/server';
import { getFirebaseAdminServices } from '@/lib/firebase-admin';
import { isValidUsername, normalizeUsername } from '@/lib/auth-utils';
import { sendPasswordResetEmail } from '@/lib/email-sender';

export const runtime = 'nodejs';

const INVALID_CREDENTIALS = 'Invalid username or password.';
const RESET_MESSAGE = 'If an account matches those details, password reset instructions will be sent.';

type IdentityToolkitResult = {
  localId?: string;
  error?: { message?: string };
};

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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

async function callIdentityToolkit(action: string, payload: Record<string, string | boolean>) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  let response: Response;
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    );
  } catch (error) {
    console.error('Firebase Identity Toolkit request failed.', error);
    return null;
  }

  let result: IdentityToolkitResult | null = null;
  try {
    result = await response.json() as IdentityToolkitResult;
  } catch (error) {
    console.error('Firebase Identity Toolkit returned invalid JSON.', error);
  }

  return { response, result };
}

async function findAccountEmail(
  username: string,
  services: ReturnType<typeof getFirebaseAdminServices> = getFirebaseAdminServices(),
) {
  const index = await services.firestore.collection('usernames').doc(username).get();
  const indexData = index.data();

  if (typeof indexData?.uid === 'string' && indexData.uid) {
    const email = await getProfileEmail(indexData.uid, username, services);
    if (email) return email;
  }

  const users = await services.firestore.collection('users')
    .where('usernameLower', '==', username)
    .limit(2)
    .get();
  if (users.size !== 1) return null;
  return getProfileEmail(users.docs[0].id, username, services);
}

async function getProfileEmail(
  uid: string,
  username: string,
  services: ReturnType<typeof getFirebaseAdminServices>,
) {
  const [profile, account] = await Promise.all([
    services.firestore.collection('users').doc(uid).get(),
    services.auth.getUser(uid),
  ]);
  const profileUsername = normalizeUsername(String(
    profile.get('usernameLower') ?? profile.get('username') ?? profile.get('name') ?? '',
  ));
  return profileUsername === username && account.email
    ? account.email.trim().toLowerCase()
    : null;
}

async function handleUsernameSignIn(username: string, password: string) {
  let email: string | null;
  let adminServices: ReturnType<typeof getFirebaseAdminServices>;
  try {
    adminServices = getFirebaseAdminServices();
    email = await findAccountEmail(username, adminServices);
  } catch (error) {
    console.error('Private username lookup failed.', error);
    return jsonResponse({ error: 'Username sign-in is temporarily unavailable. Try your email address.' }, 503);
  }

  if (!email) return jsonResponse({ error: INVALID_CREDENTIALS }, 401);

  const authResponse = await callIdentityToolkit('signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  });
  if (!authResponse) {
    return jsonResponse({ error: 'Username sign-in is temporarily unavailable. Try your email address.' }, 503);
  }

  if (!authResponse.response.ok || !authResponse.result?.localId) {
    const code = authResponse.result?.error?.message;
    if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
      return jsonResponse({ error: 'Too many sign-in attempts. Please try again later.' }, 429);
    }
    if (authResponse.response.status !== 400 || !code || ![
      'EMAIL_NOT_FOUND',
      'INVALID_PASSWORD',
      'INVALID_LOGIN_CREDENTIALS',
      'USER_DISABLED',
    ].includes(code)) {
      console.error('Firebase username sign-in failed with code:', code ?? authResponse.response.status);
      return jsonResponse({ error: 'Username sign-in is temporarily unavailable. Try your email address.' }, 503);
    }
    return jsonResponse({ error: INVALID_CREDENTIALS }, 401);
  }

  try {
    const customToken = await adminServices.auth.createCustomToken(authResponse.result.localId);
    return jsonResponse({ customToken });
  } catch (error) {
    console.error('Firebase could not create a username sign-in token.', error);
    return jsonResponse({ error: 'Username sign-in is temporarily unavailable. Try your email address.' }, 503);
  }
}

async function handlePasswordReset(identifier: string, appOrigin: string) {
  let email = identifier.trim().toLowerCase();

  if (!email.includes('@')) {
    const username = normalizeUsername(identifier);
    if (!isValidUsername(username)) return jsonResponse({ message: RESET_MESSAGE });

    try {
      email = await findAccountEmail(username) ?? '';
    } catch (error) {
      console.error('Private username lookup for password reset failed.', error);
      return jsonResponse({ error: 'Username password reset is temporarily unavailable. Try your email address.' }, 503);
    }
    if (!email) return jsonResponse({ message: RESET_MESSAGE });
  }

  try {
    const services = getFirebaseAdminServices();
    const resetUrl = await services.auth.generatePasswordResetLink(email, {
      url: new URL('/auth?reason=password-reset', appOrigin).toString(),
    });
    await sendPasswordResetEmail(email, resetUrl);
  } catch (error) {
    const code = isRecord(error) && typeof error.code === 'string' ? error.code : '';
    if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
      return jsonResponse({ message: RESET_MESSAGE });
    }
    console.error('Password reset email could not be sent.', error);
    return jsonResponse({ error: 'Password reset email could not be sent. Please try again later.' }, 503);
  }

  return jsonResponse({ message: RESET_MESSAGE });
}

export async function GET() {
  return jsonResponse({
    ok: true,
    route: 'auth',
    message: 'Email sign-in is handled by Firebase on the client. Username sign-in and password reset use private server-side account lookup and email delivery.',
    supportedMethods: ['GET', 'POST'],
  });
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ error: 'Cross-origin authentication requests are not allowed.' }, 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  if (!isRecord(payload) || typeof payload.action !== 'string') {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  if (payload.action === 'usernameSignIn') {
    if (typeof payload.username !== 'string' || typeof payload.password !== 'string' || !payload.password) {
      return jsonResponse({ error: INVALID_CREDENTIALS }, 401);
    }
    const username = normalizeUsername(payload.username);
    if (!isValidUsername(username)) return jsonResponse({ error: INVALID_CREDENTIALS }, 401);
    return handleUsernameSignIn(username, payload.password);
  }

  if (payload.action === 'passwordReset' && typeof payload.identifier === 'string' && payload.identifier.trim()) {
    return handlePasswordReset(payload.identifier, new URL(request.url).origin);
  }

  return jsonResponse({ error: 'Unsupported authentication action.' }, 400);
}
