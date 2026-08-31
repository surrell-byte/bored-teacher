// lib/firebase.ts — ESL Game Hub Firebase wrapper for Next.js
// Uses the firebase npm package (not CDN).
// Run: npm install firebase

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
  serverTimestamp,
} from 'firebase/firestore';

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

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('Firebase environment variables are missing. Set NEXT_PUBLIC_FIREBASE_* values in your environment before running the app.');
}

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
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

export async function findUserByUsername(username: string) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;

  try {
    const q = query(collection(db, 'users'), where('usernameLower', '==', normalized));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Record<string, unknown> & { email?: string };
    }
  } catch {
    // Fall back to a full scan for legacy users whose records were created before usernameLower existed.
  }

  try {
    const snap = await getDocs(collection(db, 'users'));
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as Record<string, unknown> & { email?: string; username?: string; name?: string };
      const candidate = normalizeUsername(String(data.username ?? data.name ?? ''));
      if (candidate === normalized) {
        return data;
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveUsernameToEmail(username: string): Promise<string | null> {
  const record = await findUserByUsername(username);
  if (!record?.email) return null;
  return String(record.email).trim().toLowerCase();
}

async function markUserLoggedIn(uid: string) {
  if (!uid) return;
  await setDoc(doc(db, 'users', uid), {
    lastLogin: serverTimestamp(),
    isActive: true,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ── Auth helpers ─────────────────────────────────────────────

export function onAuthStateChanged(cb: (user: User | null) => void) {
  return _onAuthStateChanged(auth, cb);
}

export async function signUp(email: string, password: string, displayName: string, role: AccountRole) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = normalizeUsername(displayName);

  if (!displayName.trim() || !isValidUsername(displayName) || cleanUsername !== displayName.trim().toLowerCase()) {
    throw new Error('Username must be 3+ characters, contain no spaces, and use only letters, numbers, dots, underscores, or hyphens.');
  }

  const usernameTaken = await findUserByUsername(cleanUsername);
  if (usernameTaken) {
    throw new Error('That username is already taken. Please choose a different one.');
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  await updateProfile(cred.user, { displayName: cleanUsername });
  await createUserProfile(cred.user.uid, cleanUsername, cleanEmail, role);
  return cred.user;
}

export async function signIn(identifier: string, password: string) {
  const rawIdentifier = identifier.trim();
  if (!rawIdentifier) {
    throw new Error('Email or username is required.');
  }

  const normalizedIdentifier = rawIdentifier.toLowerCase();
  let loginEmail = normalizedIdentifier;

  if (!rawIdentifier.includes('@')) {
    const usernameMatch = await resolveUsernameToEmail(rawIdentifier);
    if (!usernameMatch) {
      throw new Error('No account was found for that username. Please use your email or create the account first.');
    }
    loginEmail = usernameMatch;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, loginEmail, password);
    await markUserLoggedIn(cred.user.uid);
    return cred.user;
  } catch (error) {
    if (!rawIdentifier.includes('@')) {
      throw new Error('That username exists, but the password is incorrect, or the account was not yet created in Firebase.');
    }
    throw error;
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function resetPasswordByUsername(usernameOrEmail: string) {
  const raw = usernameOrEmail.trim();
  if (!raw) {
    throw new Error('Enter your email or username first.');
  }

  if (raw.includes('@')) {
    await sendPasswordResetEmail(auth, raw.toLowerCase());
    return;
  }

  const record = await findUserByUsername(raw);
  if (!record?.email) {
    throw new Error('No account was found for that username.');
  }

  await sendPasswordResetEmail(auth, String(record.email).trim().toLowerCase());
}

export async function setDisplayName(user: User, name: string) {
  const cleanName = normalizeUsername(name);
  await updateProfile(user, { displayName: cleanName });
  try {
    await updateDoc(doc(db, 'users', user.uid), { name: cleanName, username: cleanName, usernameLower: cleanName, updatedAt: serverTimestamp() });
  } catch (_) {}
}

// ── Firestore helpers ────────────────────────────────────────

type GameState = Record<string, { highScore: number; completions: number; lastAccuracy: number; totalQuestions: number }>;

interface UserState {
  name: string; username: string; usernameLower: string; avatar: string; theme: string;
  xp: number; level: number; coins: number; lastGame: string | null;
  lastLogin: unknown; loginStreak: number; sound: boolean; games: GameState;
  classId?: string; role?: AccountRole | null;
  createdAt?: unknown;
  isActive?: boolean;
  teacherPro?: boolean;
}

async function createUserProfile(uid: string, name: string, email: string, role: AccountRole) {
  const username = normalizeUsername(name);
  try {
    await setDoc(doc(db, 'users', uid), {
      name: username,
      username,
      usernameLower: username,
      email: email.toLowerCase(),
      avatar: '👤',
      theme: 'chalkboard',
      xp: 0,
      level: 1,
      coins: 0,
      lastGame: null,
      lastLogin: serverTimestamp(),
      isActive: true,
      sound: true,
      teacherPro: false,
      games: {},
      classId: '',
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (_) {}
}

export async function saveUserState(uid: string, state: Partial<UserState>) {
  if (!uid) return;
  try {
    await setDoc(doc(db, 'users', uid), { ...state, updatedAt: serverTimestamp() }, { merge: true });
  } catch (_) {}
}

export async function loadUserState(uid: string): Promise<UserState | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserState) : null;
  } catch (_) { return null; }
}

export async function getTeacherProStatus(uid: string | null | undefined): Promise<boolean> {
  if (!uid) return false;
  const profile = await loadUserState(uid);
  if (profile?.teacherPro) return true;
  return typeof window !== 'undefined' && localStorage.getItem('teacherProAccess') === 'true';
}

export async function setTeacherProAccess(uid: string | null | undefined, enabled: boolean): Promise<boolean> {
  if (!uid) return false;
  await saveUserState(uid, { teacherPro: enabled });
  if (typeof window !== 'undefined') {
    localStorage.setItem('teacherProAccess', String(enabled));
  }
  return true;
}

export async function loadUsersForCreator(): Promise<UserSummary[]> {
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
  try {
    const snap = await getDoc(doc(db, 'classCodes', code.toUpperCase().trim()));
    return snap.exists() ? (snap.data().teacherUid as string) : null;
  } catch (_) { return null; }
}

export async function setUserClass(uid: string, classId: string, role: 'teacher' | 'student') {
  await setDoc(doc(db, 'users', uid), { classId, role, updatedAt: serverTimestamp() }, { merge: true });
}

// ── Leaderboard helpers ──────────────────────────────────────

export async function saveLeaderboardState(uid: string, data: { players: unknown[] }) {
  if (!uid) return;
  try {
    await setDoc(doc(db, 'leaderboards', uid), { players: data.players || [], updatedAt: serverTimestamp() }, { merge: false });
  } catch (_) {}
}

export async function loadLeaderboardState(uid: string) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'leaderboards', uid));
    return snap.exists() ? snap.data() : null;
  } catch (_) { return null; }
}

export async function saveStudentScore(uid: string, classId: string, name: string, games: GameState) {
  if (!uid || !name || name === 'Explorer' || !classId) return;
  try {
    const converted: Record<string, { best: number; played: number }> = {};
    for (const [k, v] of Object.entries(games)) {
      converted[k] = { best: v.highScore || 0, played: v.completions || 0 };
    }
    await setDoc(doc(db, 'studentScores', uid), { classId, name, games: converted, updatedAt: serverTimestamp() });
  } catch (_) {}
}

export async function loadAllStudentScores(classId: string) {
  if (!classId) return [];
  try {
    const q = query(collection(db, 'studentScores'), where('classId', '==', classId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (_) { return []; }
}

export async function submitFeedback(data: {
  message: string;
  type: 'suggestion' | 'grievance';
  page: string;
  userId?: string | null;
  userName?: string;
}) {
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
  await updateDoc(doc(db, 'feedback', feedbackId), {
    resolved: true,
    resolvedAt: serverTimestamp(),
  });
}