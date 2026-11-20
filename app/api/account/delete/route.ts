import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { UserRecord } from 'firebase-admin/auth';
import { getFirebaseAdminServices } from '@/lib/firebase-admin';
import { sendAccountDeletedEmail } from '@/lib/email-sender';

export const runtime = 'nodejs';

const RECENT_AUTH_WINDOW_SECONDS = 5 * 60;
const FIRESTORE_BATCH_SIZE = 450;

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

async function deleteQueryResults(
  firestore: ReturnType<typeof getFirebaseAdminServices>['firestore'],
  collectionName: string,
  field: string,
  value: string,
) {
  const snapshot = await firestore.collection(collectionName).where(field, '==', value).get();
  for (let offset = 0; offset < snapshot.docs.length; offset += FIRESTORE_BATCH_SIZE) {
    const batch = firestore.batch();
    snapshot.docs.slice(offset, offset + FIRESTORE_BATCH_SIZE).forEach(item => batch.delete(item.ref));
    await batch.commit();
  }
}

async function removeLeagueMemberships(
  firestore: ReturnType<typeof getFirebaseAdminServices>['firestore'],
  uid: string,
) {
  const leagues = await firestore.collection('leagues').where('memberIds', 'array-contains', uid).get();
  const lobbies = await firestore.collection('lobbies').where('memberIds', 'array-contains', uid).get();
  const ownedLeagueIds = new Set(
    (await firestore.collection('leagues').where('ownerId', '==', uid).get()).docs.map(item => item.id),
  );
  const ownedLobbyIds = new Set(
    (await firestore.collection('lobbies').where('ownerId', '==', uid).get()).docs.map(item => item.id),
  );

  for (const [collectionName, snapshot, ownedIds, listKey, memberKey] of [
    ['leagues', leagues, ownedLeagueIds, 'members', 'userId'],
    ['lobbies', lobbies, ownedLobbyIds, 'players', 'id'],
  ] as const) {
    for (const item of snapshot.docs) {
      if (ownedIds.has(item.id)) continue;
      const data = item.data();
      const members = Array.isArray(data[listKey])
        ? data[listKey].filter(member => !isRecord(member) || member[memberKey] !== uid)
        : [];
      const memberIds = Array.isArray(data.memberIds)
        ? data.memberIds.filter(memberId => memberId !== uid)
        : [];
      const update: Record<string, unknown> = { [listKey]: members, memberIds };
      if (collectionName === 'lobbies' && Array.isArray(data.matches)) {
        update.matches = data.matches.filter(match => !isRecord(match) || match.playerId !== uid);
      }
      await item.ref.update(update);
    }
  }

  await Promise.all([
    ...[...ownedLeagueIds].map(id => firestore.collection('leagues').doc(id).delete()),
    ...[...ownedLobbyIds].map(id => firestore.collection('lobbies').doc(id).delete()),
  ]);
}

async function deleteTeacherClasses(
  firestore: ReturnType<typeof getFirebaseAdminServices>['firestore'],
  uid: string,
) {
  const classes = await firestore.collection('classCodes').where('teacherUid', '==', uid).get();
  for (const classDocument of classes.docs) {
    await deleteQueryResults(firestore, 'studentScores', 'classId', classDocument.id);
    await classDocument.ref.delete();
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ ok: false, error: 'Cross-origin account requests are not allowed.' }, 403);
  }

  const tokenMatch = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return jsonResponse({ ok: false, error: 'Sign in again before deleting your account.' }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid request body.' }, 400);
  }
  if (!isRecord(body)) return jsonResponse({ ok: false, error: 'Invalid request body.' }, 400);

  let services: ReturnType<typeof getFirebaseAdminServices>;
  try {
    services = getFirebaseAdminServices();
  } catch (error) {
    console.error('Firebase Admin is unavailable for account deletion.', error);
    return jsonResponse({ ok: false, error: 'Account deletion is temporarily unavailable.' }, 503);
  }

  let decoded: { uid: string; auth_time?: number };
  try {
    decoded = await services.auth.verifyIdToken(tokenMatch[1], true);
  } catch (error) {
    console.error('Account deletion authentication failed.', error);
    return jsonResponse({ ok: false, error: 'Your sign-in expired. Sign in again before deleting your account.' }, 401);
  }

  const authTime = typeof decoded.auth_time === 'number' ? decoded.auth_time : 0;
  if (!authTime || Date.now() / 1000 - authTime > RECENT_AUTH_WINDOW_SECONDS) {
    return jsonResponse({ ok: false, error: 'Please confirm your password again before deleting your account.' }, 401);
  }

  let user: UserRecord;
  try {
    user = await services.auth.getUser(decoded.uid);
  } catch (error) {
    console.error('Account deletion could not load the signed-in user.', error);
    return jsonResponse({ ok: false, error: 'Your account could not be found.' }, 404);
  }
  if (!user.email) return jsonResponse({ ok: false, error: 'This account has no email address to confirm deletion.' }, 400);

  const profileRef = services.firestore.collection('users').doc(user.uid);
  let profileName: unknown;
  try {
    profileName = (await profileRef.get()).get('name');
  } catch (error) {
    console.error('Account deletion could not load the profile.', error);
    return jsonResponse({ ok: false, error: 'Account deletion could not load your profile. Please try again.' }, 503);
  }
  const displayName = typeof profileName === 'string' && profileName.trim()
    ? profileName.trim()
    : user.displayName || 'Player';
  const emailHash = createHash('sha256').update(user.email.trim().toLowerCase()).digest('hex');

  try {
    await Promise.all([
      deleteQueryResults(services.firestore, 'usernames', 'uid', user.uid),
      deleteQueryResults(services.firestore, 'feedback', 'userId', user.uid),
      deleteQueryResults(services.firestore, 'reviews', 'userId', user.uid),
      deleteQueryResults(services.firestore, 'notifications', 'userId', user.uid),
      deleteQueryResults(services.firestore, 'notifications', 'recipientUid', user.uid),
      services.firestore.collection('leaderboards').doc(user.uid).delete(),
      services.firestore.collection('studentScores').doc(user.uid).delete(),
      services.firestore.collection('emailVerificationCodes').doc(user.uid).delete(),
      services.firestore.collection('emailVerificationRateLimits').doc(emailHash).delete(),
      services.firestore.collection('supportEmailRateLimits').doc(user.uid).delete(),
    ]);
    await deleteTeacherClasses(services.firestore, user.uid);
    await removeLeagueMemberships(services.firestore, user.uid);
    await profileRef.delete();
    await services.auth.deleteUser(user.uid);
  } catch (error) {
    console.error('Account data cleanup failed.', error);
    return jsonResponse({ ok: false, error: 'Account deletion could not be completed. Please try again or contact support.' }, 500);
  }

  let emailSent = true;
  try {
    await sendAccountDeletedEmail(user.email, displayName);
  } catch (error) {
    emailSent = false;
    console.error('Account deletion confirmation email could not be sent.', error);
  }

  return jsonResponse({ ok: true, emailSent });
}
