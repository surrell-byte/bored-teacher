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
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyDFmwJU6iOtdbkQVE55V2rAGdyoBXCHLww',
  authDomain:        'bored-teacher-bd713.firebaseapp.com',
  projectId:         'bored-teacher-bd713',
  storageBucket:     'bored-teacher-bd713.firebasestorage.app',
  messagingSenderId: '137147011880',
  appId:             '1:137147011880:web:220a1e591fde2b24ee361d',
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

// ── Auth helpers ─────────────────────────────────────────────

export function onAuthStateChanged(cb: (user: User | null) => void) {
  return _onAuthStateChanged(auth, cb);
}

export async function signUp(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await createUserProfile(cred.user.uid, displayName, email);
  return cred.user;
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function setDisplayName(user: User, name: string) {
  await updateProfile(user, { displayName: name });
  try {
    await updateDoc(doc(db, 'users', user.uid), { name, updatedAt: serverTimestamp() });
  } catch (_) {}
}

// ── Firestore helpers ────────────────────────────────────────

type GameState = Record<string, { highScore: number; completions: number; lastAccuracy: number; totalQuestions: number }>;

interface UserState {
  name: string; username: string; avatar: string; theme: string;
  xp: number; level: number; coins: number; lastGame: string | null;
  lastLogin: string; loginStreak: number; sound: boolean; games: GameState;
  classId?: string; role?: 'teacher' | 'student' | null;
}

async function createUserProfile(uid: string, name: string, email: string) {
  try {
    await setDoc(doc(db, 'users', uid), {
      name, email, username: '', avatar: '👤', theme: 'chalkboard',
      xp: 0, level: 1, coins: 0, lastGame: null, lastLogin: '', sound: true,
      games: {}, classId: '', role: null,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
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