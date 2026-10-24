// lib/firebase.ts — ESL Game Hub Firebase wrapper for Next.js
// Uses the firebase npm package (not CDN).
// Run: npm install firebase

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  deleteUser,
  signOut as firebaseSignOut,
  onAuthStateChanged as _onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  query,
  where,
  updateDoc,
  increment,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { DEFAULT_PLAYER_AVATAR } from '@/constants/index';

export interface ReviewItem {
  id?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | null;
  approvedAt?: unknown;
  userId?: string | null;
  userName?: string;
  userEmail?: string | null;
  avatar?: string;
  age?: number | null;
  countryCode?: string;
  rating: number;
  comment: string;
  page?: string;
  createdAt?: unknown;
}

const FALLBACK_REVIEWS: ReviewItem[] = [
  { id: 'fallback-1', userName: 'Mina', avatar: '👩🏽‍🏫', age: 29, countryCode: 'GB', rating: 5, comment: 'The new learning path feels calm, joyful, and classroom friendly.', page: '/hub', createdAt: Date.now() },
  { id: 'fallback-2', userName: 'Kai', avatar: '🧑🏻‍💻', age: 34, countryCode: 'CA', rating: 4, comment: 'Loved the game choices and the helpful classroom flow.', page: '/hub', createdAt: Date.now() - 3600000 },
  { id: 'fallback-3', userName: 'Ari', avatar: '🧑🏾‍🎨', age: 27, countryCode: 'AU', rating: 5, comment: 'The activities are bright, easy to understand, and fun to revisit.', page: '/hub', createdAt: Date.now() - 7200000 },
  { id: 'fallback-4', userName: 'Sam', avatar: '🧑🏼‍🏫', age: 41, countryCode: 'US', rating: 5, comment: 'A thoughtful learning space with games children actually want to play.', page: '/hub', createdAt: Date.now() - 10800000 },
];

export function hasPublicReviewIdentity(
  review: Pick<ReviewItem, 'userId' | 'userName' | 'avatar'>,
) {
  const name = review.userName?.trim() ?? '';
  const normalizedName = name.toLowerCase();
  const avatar = review.avatar?.trim() ?? '';
  const letterCount = name.match(/\p{L}/gu)?.length ?? 0;

  return Boolean(
    review.userId?.trim()
    && letterCount >= 2
    && !['explorer', 'guest', 'creator'].includes(normalizedName)
    && !name.includes('@')
    && avatar
    && avatar !== '👤'
    && avatar !== '🙂',
  );
}

export interface CreatorNotificationItem {
  id?: string;
  type: 'review-comment' | 'feedback' | 'system';
  recipientEmail?: string | null;
  recipientUid?: string | null;
  userId?: string | null;
  userName?: string;
  title: string;
  message: string;
  reviewId?: string | null;
  page?: string;
  createdAt?: unknown;
  read?: boolean;
}
import { isVerificationExpired } from '@/lib/email-verification';

export type AccountRole = 'teacher' | 'student';

export const CREATOR_EMAIL = 'boredteacherapp@gmail.com';

export function isCreatorUser(user: Pick<User, 'email'> | null | undefined): boolean {
  return !!user?.email && user.email.trim().toLowerCase() === CREATOR_EMAIL;
}

export interface UserSummary {
  uid: string;
  name: string;
  username: string;
  email: string;
  role: AccountRole | null;
  classId?: string | null;
  createdAt?: Date | null;
  lastLogin?: Date | null;
  isActive: boolean;
  teacherPro: boolean;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

const missingFirebaseKeys = Object.entries({
  NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
}).filter(([, value]) => !value).map(([key]) => key);

const hasFirebaseConfig = missingFirebaseKeys.length === 0;

export function firebaseConfigError(): string | null {
  return hasFirebaseConfig ? null : `Firebase is not configured. Missing: ${missingFirebaseKeys.join(', ')}. Restart the Next.js server after updating .env.local.`;
}

if (!hasFirebaseConfig) {
  console.warn('Firebase environment variables are missing. Set NEXT_PUBLIC_FIREBASE_* values in your environment before running the app.');
}

const app = hasFirebaseConfig ? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig)) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

if (typeof window !== 'undefined' && auth) {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

function requireFirebase() {
  if (!auth || !db) {
    throw new Error(firebaseConfigError() || 'Firebase is not available.');
  }
  return { auth, db };
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

export function isValidUsername(value: string): boolean {
  const raw = String(value ?? '');
  if (!raw.trim() || raw !== raw.trim()) return false;
  if (/\s/.test(raw)) return false;

  const cleaned = normalizeUsername(raw);
  return cleaned.length >= 3 && /^[a-z0-9._-]+$/.test(cleaned) && raw === cleaned;
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export function isUserActive(user: Partial<Record<string, unknown>>): boolean {
  const lastLogin = asDate(user.lastLogin as unknown);
  if (!lastLogin) return false;
  const thirtyDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 30;
  return lastLogin.getTime() >= thirtyDaysAgo;
}

async function markUserLoggedIn(uid: string) {
  if (!uid || !db) return;
  await setDoc(doc(db, 'users', uid), {
    lastLogin: serverTimestamp(),
    isActive: true,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ── Auth helpers ─────────────────────────────────────────────

export function onAuthStateChanged(cb: (user: User | null) => void) {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return _onAuthStateChanged(auth, cb);
}

export async function signUp(email: string, password: string, displayName: string, role: AccountRole) {
  if (!auth || !db) {
    throw new Error(firebaseConfigError() || 'Firebase is not available.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = normalizeUsername(displayName);

  if (!displayName.trim() || !isValidUsername(displayName) || cleanUsername !== displayName.trim().toLowerCase()) {
    throw new Error('Username must be 3+ characters, contain no spaces, and use only letters, numbers, dots, underscores, or hyphens.');
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  try {
    await updateProfile(cred.user, { displayName: cleanUsername });
    await createUserProfile(cred.user.uid, cleanUsername, cleanEmail, role);
  } catch (error) {
    try {
      await deleteUser(cred.user);
    } catch (cleanupError) {
      console.error('Failed to remove an incomplete account after profile setup failed.', cleanupError);
      throw new Error('Account setup failed and could not be rolled back. Please contact support.');
    }
    if (
      typeof error === 'object'
      && error !== null
      && 'code' in error
      && error.code === 'permission-denied'
    ) {
      throw new Error('That username is already taken. Please choose a different one.');
    }
    throw error;
  }
  return cred.user;
}

export async function signIn(identifier: string, password: string) {
  if (!auth || !db) {
    throw new Error(firebaseConfigError() || 'Firebase is not available.');
  }

  const rawIdentifier = identifier.trim();
  if (!rawIdentifier) {
    throw new Error('Email or username is required.');
  }

  let user: User;
  if (rawIdentifier.includes('@')) {
    user = (await signInWithEmailAndPassword(auth, rawIdentifier.toLowerCase(), password)).user;
  } else {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'usernameSignIn', username: rawIdentifier, password }),
    });
    const result = await response.json() as { customToken?: unknown; error?: unknown };
    if (!response.ok || typeof result.customToken !== 'string') {
      throw new Error(typeof result.error === 'string' ? result.error : 'Invalid username or password.');
    }
    user = (await signInWithCustomToken(auth, result.customToken)).user;
  }

  await markUserLoggedIn(user.uid);
  return user;
}

export async function signOut() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  if (!auth) {
    throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* values in your environment before resetting passwords.');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

export async function resetPasswordByUsername(usernameOrEmail: string) {
  if (!auth) {
    throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* values in your environment before resetting passwords.');
  }

  const raw = usernameOrEmail.trim();
  if (!raw) {
    throw new Error('Enter your email or username first.');
  }

  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'passwordReset', identifier: raw }),
  });
  const result = await response.json() as { message?: unknown; error?: unknown };
  if (!response.ok) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Password reset is temporarily unavailable.');
  }
}

export async function setDisplayName(user: User, name: string) {
  if (!db) {
    throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* values in your environment before updating profile data.');
  }

  const cleanName = normalizeUsername(name);
  if (!isValidUsername(cleanName)) {
    throw new Error('Username must be 3+ characters and use only letters, numbers, dots, underscores, or hyphens.');
  }
  const email = user.email?.trim().toLowerCase();
  if (!email) throw new Error('An email address is required to update the username.');

  const batch = writeBatch(db);
  batch.update(doc(db, 'users', user.uid), {
    name: cleanName,
    username: cleanName,
    usernameLower: cleanName,
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(db, 'usernames', cleanName), { uid: user.uid, email }, { merge: true });
  await batch.commit();
  await updateProfile(user, { displayName: cleanName });
}

// ── Firestore helpers ────────────────────────────────────────

type GameState = Record<string, { highScore: number; completions: number; lastAccuracy: number; totalQuestions: number }>;

interface UserState {
  name: string; username: string; usernameLower: string; email?: string; avatar: string; theme: string;
  xp: number; level: number; coins: number; lastGame: string | null;
  lastLogin: unknown; loginStreak: number; sound: boolean; games: GameState;
  classId?: string; role?: AccountRole | null;
  ownedItems?: string[];
  createdAt?: unknown;
  totalPlaySeconds?: number;
  isActive?: boolean;
  teacherPro?: boolean;
  emailVerified?: boolean;
  emailVerificationCode?: string;
  emailVerificationSentAt?: number | string | null;
  welcomeGiftClaimed?: boolean;
  welcomeGiftId?: string | null;
}

async function createUserProfile(uid: string, name: string, email: string, role: AccountRole) {
  if (!db) {
    throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* values in your environment before creating an account.');
  }

  const username = normalizeUsername(name);
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', uid), {
    name: username,
    username,
    usernameLower: username,
    email: email.toLowerCase(),
    avatar: DEFAULT_PLAYER_AVATAR,
    theme: 'chalkboard',
    xp: 0,
    level: 1,
    coins: 0,
    lastGame: null,
    lastLogin: serverTimestamp(),
    isActive: true,
    sound: true,
    teacherPro: false,
    emailVerified: false,
    emailVerificationCode: '',
    emailVerificationSentAt: 0,
    welcomeGiftClaimed: false,
    welcomeGiftId: null,
    games: {},
    totalPlaySeconds: 0,
    classId: '',
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(db, 'usernames', username), { uid, email: email.toLowerCase() });
  await batch.commit();
}

export async function saveUserState(uid: string, state: Partial<UserState>) {
  if (!uid || !db) return;
  const writableState = Object.fromEntries(Object.entries(state).filter(([key]) => [
    'name', 'username', 'usernameLower', 'avatar', 'theme', 'sound', 'games', 'xp', 'level', 'coins',
    'lastGame', 'loginStreak', 'classId', 'emailVerificationCode', 'emailVerificationSentAt',
    'emailVerified', 'welcomeGiftClaimed', 'welcomeGiftId', 'ownedItems', 'lastLogin', 'isActive'
  ].includes(key)));
  try {
    const username = typeof writableState.usernameLower === 'string' ? writableState.usernameLower : '';
    const email = auth?.currentUser?.email?.trim().toLowerCase();
    const profile = { ...writableState, updatedAt: serverTimestamp() };

    if (username && email) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', uid), profile, { merge: true });
      batch.set(doc(db, 'usernames', username), { uid, email }, { merge: true });
      await batch.commit();
    } else {
      await setDoc(doc(db, 'users', uid), profile, { merge: true });
    }
  } catch (error) {
    if (typeof writableState.usernameLower === 'string') throw error;
  }
}

export async function addUserPlayTime(uid: string, seconds: number) {
  if (!uid || !db) return;
  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error('Game time must be a positive whole number of seconds.');
  }
  await updateDoc(doc(db, 'users', uid), {
    totalPlaySeconds: increment(seconds),
    updatedAt: serverTimestamp(),
  });
}

export async function loadUserState(uid: string): Promise<UserState | null> {
  if (!uid || !db) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserState) : null;
  } catch (_) { return null; }
}

export async function getTeacherProStatus(uid: string | null | undefined): Promise<boolean> {
  if (!uid) return false;
  const profile = await loadUserState(uid);
  return Boolean(profile?.teacherPro);
}

export async function setTeacherProAccess(uid: string | null | undefined, enabled: boolean): Promise<boolean> {
  void uid;
  void enabled;
  throw new Error('Teacher Pro access is granted only after verified payment confirmation.');
}

export async function setCreatorTeacherProAccess(uid: string, enabled: boolean): Promise<void> {
  if (!auth?.currentUser || !isCreatorUser(auth.currentUser)) {
    throw new Error('Only the creator account can change Teacher Pro access.');
  }
  if (!uid || !db) {
    throw new Error(firebaseConfigError() || 'Firebase is not available.');
  }
  await updateDoc(doc(db, 'users', uid), {
    teacherPro: enabled,
    teacherProSource: 'creator-manual',
    teacherProUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function loadUsersForCreator(): Promise<UserSummary[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs
      .map((docSnap) => {
        const data = docSnap.data() as Partial<UserState> & { email?: string; name?: string; username?: string; role?: AccountRole | null; classId?: string | null; };
        const createdAt = asDate(data.createdAt as unknown);
        const lastLogin = asDate(data.lastLogin as unknown);
        return {
          uid: docSnap.id,
          name: String(data.name || data.username || 'Unknown'),
          username: String(data.username || data.name || 'unknown'),
          email: String(data.email || ''),
          role: data.role ?? null,
          classId: data.classId ?? null,
          createdAt,
          lastLogin,
          isActive: isUserActive(data),
          teacherPro: Boolean(data.teacherPro),
        } satisfies UserSummary;
      })
      .sort((left, right) => {
        const leftTime = left.createdAt?.getTime?.() ?? 0;
        const rightTime = right.createdAt?.getTime?.() ?? 0;
        return rightTime - leftTime;
      });
  } catch {
    return [];
  }
}

// ── Class code helpers ────────────────────────────────────────

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I — avoids confusion read aloud
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createClassCode(teacherUid: string): Promise<string> {
  if (!db) {
    throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* values in your environment before creating class codes.');
  }

  let code = generateClassCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await getDoc(doc(db, 'classCodes', code));
    if (!existing.exists()) break;
    code = generateClassCode();
  }
  await setDoc(doc(db, 'classCodes', code), { teacherUid, createdAt: serverTimestamp() });
  return code;
}

export async function resolveClassCode(code: string): Promise<string | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'classCodes', code.toUpperCase().trim()));
    return snap.exists() ? (snap.data().teacherUid as string) : null;
  } catch (_) { return null; }
}

export async function setUserClass(uid: string, classId: string, role: 'teacher' | 'student') {
  if (!db) return;
  await setDoc(doc(db, 'users', uid), { classId, role, updatedAt: serverTimestamp() }, { merge: true });
}

// ── Leaderboard helpers ──────────────────────────────────────

export async function saveLeaderboardState(uid: string, data: { players: unknown[] }) {
  if (!uid || !db) return;
  try {
    await setDoc(doc(db, 'leaderboards', uid), { players: data.players || [], updatedAt: serverTimestamp() }, { merge: false });
  } catch (_) {}
}

export async function loadLeaderboardState(uid: string) {
  if (!uid || !db) return null;
  try {
    const snap = await getDoc(doc(db, 'leaderboards', uid));
    return snap.exists() ? snap.data() : null;
  } catch (_) { return null; }
}

export async function saveStudentScore(uid: string, classId: string, name: string, games: GameState) {
  if (!uid || !name || name === 'Explorer' || !classId || !db) return;
  try {
    const converted: Record<string, { best: number; played: number }> = {};
    for (const [k, v] of Object.entries(games)) {
      converted[k] = { best: v.highScore || 0, played: v.completions || 0 };
    }
    await setDoc(doc(db, 'studentScores', uid), { classId, name, games: converted, updatedAt: serverTimestamp() });
  } catch (_) {}
}

export async function loadAllStudentScores(classId: string) {
  if (!classId || !db) return [];
  try {
    const q = query(collection(db, 'studentScores'), where('classId', '==', classId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (_) { return []; }
}

export async function submitReview(data: {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  avatar?: string;
  age?: number | null;
  countryCode?: string;
  rating: number;
  comment: string;
  page?: string;
}) {
  if (!db) {
    throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* values in your environment before submitting a review.');
  }

  const rating = Math.min(5, Math.max(1, Math.round(Number(data.rating) || 5)));
  const comment = String(data.comment ?? '').trim();
  if (!comment) throw new Error('Review comment text is required.');
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error('Sign in before submitting a review.');
  if (data.userId && data.userId !== currentUser.uid) {
    throw new Error('Reviews can only be submitted for the signed-in account.');
  }

  const review = {
    userId: currentUser.uid,
    userName: (data.userName ?? auth?.currentUser?.displayName ?? 'Explorer').trim() || 'Explorer',
    userEmail: (data.userEmail ?? auth?.currentUser?.email ?? '').trim().toLowerCase() || null,
    avatar: data.avatar ?? '🙂',
    age: data.age ?? null,
    countryCode: data.countryCode?.trim().toUpperCase() || 'GB',
    rating,
    comment,
    page: data.page ?? '/hub',
    approvalStatus: 'pending',
    approvedBy: null,
    approvedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const reviewSnap = await addDoc(collection(db, 'reviews'), review);

  await addDoc(collection(db, 'notifications'), {
    type: 'review-comment',
    recipientEmail: CREATOR_EMAIL,
    recipientUid: null,
    userId: data.userId ?? auth?.currentUser?.uid ?? null,
    userName: review.userName,
    title: 'Review awaiting approval',
    message: `${review.userName} submitted a ${rating}/5 review for approval: ${comment}`,
    reviewId: reviewSnap.id,
    page: data.page ?? '/hub',
    rating,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function loadReviews() {
  if (!db) return FALLBACK_REVIEWS;

  const snapshot = await getDocs(query(collection(db, 'reviews'), where('approvalStatus', '==', 'approved')));
  const items = snapshot.docs
    .map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as Record<string, unknown>) } as ReviewItem))
    .filter(item => Number(item.rating) >= 4 && hasPublicReviewIdentity(item))
    .sort((left, right) => reviewCreatedAt(right) - reviewCreatedAt(left));

  return [
    ...items,
    ...FALLBACK_REVIEWS.filter(fallback => !items.some(item => item.comment === fallback.comment)),
  ]
    .slice(0, 4)
    .map(item => ({ ...item, rating: Number(item.rating) }));
}

function reviewCreatedAt(review: ReviewItem) {
  return review.createdAt && typeof (review.createdAt as { toMillis?: () => number }).toMillis === 'function'
    ? (review.createdAt as { toMillis: () => number }).toMillis()
    : new Date(String(review.createdAt ?? 0)).getTime();
}

export async function loadPendingReviewsForCreator() {
  if (!auth?.currentUser || !isCreatorUser(auth.currentUser)) {
    throw new Error('Only the creator can review pending submissions.');
  }
  if (!db) {
    throw new Error('Firebase is not configured. Pending reviews cannot be loaded.');
  }

  const snapshot = await getDocs(query(collection(db, 'reviews'), where('approvalStatus', '==', 'pending')));
  return snapshot.docs
    .map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as Record<string, unknown>) } as ReviewItem))
    .sort((left, right) => reviewCreatedAt(right) - reviewCreatedAt(left));
}

export async function setReviewApproval(reviewId: string, approvalStatus: 'approved' | 'rejected') {
  if (!reviewId.trim()) throw new Error('Review id is required.');
  if (approvalStatus !== 'approved' && approvalStatus !== 'rejected') {
    throw new Error('Review approval status is invalid.');
  }
  if (!auth?.currentUser || !isCreatorUser(auth.currentUser)) {
    throw new Error('Only the creator can approve or reject reviews.');
  }
  if (!db) {
    throw new Error('Firebase is not configured. Review approval cannot be saved.');
  }

  await updateDoc(doc(db, 'reviews', reviewId), {
    approvalStatus,
    approvedBy: auth.currentUser.email,
    approvedAt: serverTimestamp(),
  });
}

export async function loadNotificationsForCreator() {
  if (!db) return [];

  try {
    const snap = await getDocs(query(collection(db, 'notifications'), where('recipientEmail', '==', CREATOR_EMAIL)));
    return snap.docs
      .map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as Record<string, unknown>) } as CreatorNotificationItem))
      .sort((left, right) => {
        const leftTime = left.createdAt && typeof (left.createdAt as { toMillis?: () => number }).toMillis === 'function'
          ? (left.createdAt as { toMillis: () => number }).toMillis()
          : new Date(String(left.createdAt ?? 0)).getTime();
        const rightTime = right.createdAt && typeof (right.createdAt as { toMillis?: () => number }).toMillis === 'function'
          ? (right.createdAt as { toMillis: () => number }).toMillis()
          : new Date(String(right.createdAt ?? 0)).getTime();
        return rightTime - leftTime;
      });
  } catch {
    return [];
  }
}

export async function submitFeedback(data: {
  message: string;
  type: 'suggestion' | 'grievance';
  page: string;
  userId?: string | null;
  userName?: string;
}) {
  if (!db) {
    throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* values in your environment before submitting feedback.');
  }

  const message = data.message.trim();
  if (!message) throw new Error('Feedback message is required');

  await addDoc(collection(db, 'feedback'), {
    message,
    type: data.type,
    page: data.page,
    userId: data.userId ?? null,
    userName: data.userName ?? 'Guest',
    createdAt: serverTimestamp(),
  });
}

export async function loadFeedback() {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'feedback'));
  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .sort((left: any, right: any) => {
      const leftTime = left.createdAt?.toMillis?.() ?? 0;
      const rightTime = right.createdAt?.toMillis?.() ?? 0;
      return rightTime - leftTime;
    });
}

export async function resolveFeedback(feedbackId: string) {
  if (!feedbackId) throw new Error('Feedback id is required');
  if (!db) return;
  await updateDoc(doc(db, 'feedback', feedbackId), {
    resolved: true,
    resolvedAt: serverTimestamp(),
  });
}