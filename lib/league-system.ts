import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

export type LeagueType = 'daily' | 'weekly' | 'monthly';
export type LeagueRole = 'student' | 'teacher';

export interface LeagueMember {
  userId: string;
  name: string;
  role: LeagueRole;
  score: number;
  updatedAt: string;
}

export interface LeagueRecord {
  id: string;
  name: string;
  type: LeagueType;
  ownerId: string;
  ownerName: string;
  ownerRole: LeagueRole;
  createdAt: string;
  members: LeagueMember[];
}

export interface LobbyResult {
  playerId: string;
  playerName: string;
  score: number;
  accuracy: number;
  role: LeagueRole;
  createdAt: string;
}

export interface LobbyRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  gameId: string;
  gameName: string;
  players: Array<{ id: string; name: string; role: LeagueRole }>;
  matches: LobbyResult[];
  createdAt: string;
}

const LEAGUE_KEY = 'eslhub_leagues_v1';
const LOBBY_KEY = 'eslhub_lobbies_v1';
const DEFAULT_LEAGUES: LeagueRecord[] = [];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function mapTimestamp(value: unknown, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return fallback;
}

function normalizeLeague(raw: Record<string, unknown>, id: string): LeagueRecord {
  const members = Array.isArray(raw.members)
    ? raw.members.map((member, index) => ({
        userId: String((member as Record<string, unknown>)?.userId ?? `member-${index}`),
        name: String((member as Record<string, unknown>)?.name ?? 'Player'),
        role: ((member as Record<string, unknown>)?.role === 'teacher' ? 'teacher' : 'student') as LeagueRole,
        score: Number((member as Record<string, unknown>)?.score ?? 0),
        updatedAt: mapTimestamp((member as Record<string, unknown>)?.updatedAt, new Date().toISOString()),
      }))
    : [];

  return {
    id,
    name: String(raw.name ?? 'League'),
    type: (raw.type === 'weekly' || raw.type === 'monthly' ? raw.type : 'daily') as LeagueType,
    ownerId: String(raw.ownerId ?? ''),
    ownerName: String(raw.ownerName ?? 'Owner'),
    ownerRole: raw.ownerRole === 'teacher' ? 'teacher' : 'student',
    createdAt: mapTimestamp(raw.createdAt, new Date().toISOString()),
    members,
  };
}

function normalizeLobby(raw: Record<string, unknown>, id: string): LobbyRecord {
  const players = Array.isArray(raw.players)
    ? raw.players.map((player, index) => ({
        id: String((player as Record<string, unknown>)?.id ?? `player-${index}`),
        name: String((player as Record<string, unknown>)?.name ?? 'Player'),
        role: ((player as Record<string, unknown>)?.role === 'teacher' ? 'teacher' : 'student') as LeagueRole,
      }))
    : [];
  const matches = Array.isArray(raw.matches)
    ? raw.matches.map((match) => ({
        playerId: String((match as Record<string, unknown>)?.playerId ?? ''),
        playerName: String((match as Record<string, unknown>)?.playerName ?? 'Player'),
        score: Number((match as Record<string, unknown>)?.score ?? 0),
        accuracy: Number((match as Record<string, unknown>)?.accuracy ?? 0),
        role: ((match as Record<string, unknown>)?.role === 'teacher' ? 'teacher' : 'student') as LeagueRole,
        createdAt: mapTimestamp((match as Record<string, unknown>)?.createdAt, new Date().toISOString()),
      }))
    : [];

  return {
    id,
    ownerId: String(raw.ownerId ?? ''),
    ownerName: String(raw.ownerName ?? 'Owner'),
    gameId: String(raw.gameId ?? 'tictacroll'),
    gameName: String(raw.gameName ?? 'Tic Tac Roll'),
    players,
    matches,
    createdAt: mapTimestamp(raw.createdAt, new Date().toISOString()),
  };
}

export async function getLeagues(): Promise<LeagueRecord[]> {
  if (db) {
    try {
      const snapshot = await getDocs(query(collection(db, 'leagues'), orderBy('createdAt', 'desc')));
      return snapshot.docs.map((docSnap) => normalizeLeague(docSnap.data(), docSnap.id));
    } catch {
      // fall back to local storage below
    }
  }
  return readJson<LeagueRecord[]>(LEAGUE_KEY, DEFAULT_LEAGUES);
}

export function subscribeToLobbies(callback: (lobbies: LobbyRecord[]) => void) {
  if (!db) {
    callback(readJson<LobbyRecord[]>(LOBBY_KEY, []));
    return () => {};
  }

  return onSnapshot(query(collection(db, 'lobbies'), orderBy('createdAt', 'desc')), (snapshot) => {
    callback(snapshot.docs.map((docSnap) => normalizeLobby(docSnap.data(), docSnap.id)));
  }, () => {
    callback(readJson<LobbyRecord[]>(LOBBY_KEY, []));
  });
}

export async function saveLeagues(leagues: LeagueRecord[]) {
  writeJson(LEAGUE_KEY, leagues);
  if (!db) return;
  const firestore = db;
  try {
    const snapshot = await getDocs(collection(firestore, 'leagues'));
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(doc(firestore, 'leagues', docSnap.id))));
    await Promise.all(
      leagues.map((league) =>
        addDoc(collection(firestore, 'leagues'), {
          id: league.id,
          name: league.name,
          type: league.type,
          ownerId: league.ownerId,
          ownerName: league.ownerName,
          ownerRole: league.ownerRole,
          createdAt: serverTimestamp(),
          members: league.members,
        }),
      ),
    );
  } catch {
    // ignore write failure and keep local state as fallback
  }
}

export async function createLeague(input: { name: string; type: LeagueType; ownerId: string; ownerName: string; ownerRole: LeagueRole }) {
  const next: LeagueRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim() || 'New League',
    type: input.type,
    ownerId: input.ownerId,
    ownerName: input.ownerName,
    ownerRole: input.ownerRole,
    createdAt: new Date().toISOString(),
    members: [
      { userId: input.ownerId, name: input.ownerName, role: input.ownerRole, score: 0, updatedAt: new Date().toISOString() },
    ],
  };

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'leagues'), {
        ...next,
        createdAt: serverTimestamp(),
        members: next.members.map((member) => ({ ...member, updatedAt: serverTimestamp() })),
      });
      return { ...next, id: docRef.id };
    } catch {
      // fall through to local persistence below
    }
  }

  const leagues = readJson<LeagueRecord[]>(LEAGUE_KEY, DEFAULT_LEAGUES);
  writeJson(LEAGUE_KEY, [next, ...leagues]);
  return next;
}

export async function updateLeague(leagueId: string, patch: Partial<{ name: string; type: LeagueType }>) {
  const leagues = await getLeagues();
  const next = leagues.map((league) => (league.id === leagueId ? { ...league, ...patch } : league));
  await saveLeagues(next);
  return next.find((league) => league.id === leagueId) ?? null;
}

export async function deleteLeague(leagueId: string) {
  if (db) {
    try {
      await deleteDoc(doc(db, 'leagues', leagueId));
    } catch {
      // fallback to local delete below
    }
  }
  const leagues = (await getLeagues()).filter((league) => league.id !== leagueId);
  writeJson(LEAGUE_KEY, leagues);
  return leagues;
}

export async function joinLeague(leagueId: string, member: { userId: string; name: string; role: LeagueRole }) {
  const leagues = await getLeagues();
  const target = leagues.find((league) => league.id === leagueId);
  if (!target) return null;
  const alreadyJoined = target.members.some((player) => player.userId === member.userId);
  if (alreadyJoined) return target;
  const updated: LeagueRecord = {
    ...target,
    members: [
      ...target.members,
      { userId: member.userId, name: member.name, role: member.role, score: 0, updatedAt: new Date().toISOString() },
    ],
  };

  if (db) {
    try {
      await updateDoc(doc(db, 'leagues', leagueId), {
        members: updated.members,
      });
      return updated;
    } catch {
      // fall back below
    }
  }

  const next = leagues.map((league) => (league.id === leagueId ? updated : league));
  writeJson(LEAGUE_KEY, next);
  return updated;
}

export async function leaveLeague(leagueId: string, userId: string) {
  const leagues = await getLeagues();
  const target = leagues.find((league) => league.id === leagueId);
  if (!target) return null;
  const updated: LeagueRecord = {
    ...target,
    members: target.members.filter((member) => member.userId !== userId),
  };

  if (db) {
    try {
      await updateDoc(doc(db, 'leagues', leagueId), {
        members: updated.members,
      });
      return updated;
    } catch {
      // fall back below
    }
  }

  const next = leagues.map((league) => (league.id === leagueId ? updated : league));
  writeJson(LEAGUE_KEY, next);
  return updated;
}

export async function submitLeagueScore(input: { leagueId: string; userId: string; name: string; role: LeagueRole; score: number }) {
  const leagues = await getLeagues();
  const league = leagues.find((item) => item.id === input.leagueId);
  if (!league) return null;

  const members = league.members.map((member) =>
    member.userId === input.userId
      ? { ...member, name: input.name || member.name, role: input.role, score: Math.max(member.score, input.score), updatedAt: new Date().toISOString() }
      : member,
  );

  const updated = { ...league, members: members.sort((a, b) => b.score - a.score) };

  if (db) {
    try {
      await updateDoc(doc(db, 'leagues', input.leagueId), {
        members: updated.members,
      });
      return updated;
    } catch {
      // fall back below
    }
  }

  const next = leagues.map((item) => (item.id === input.leagueId ? updated : item));
  writeJson(LEAGUE_KEY, next);
  return updated;
}

export async function getLeaguesForUser(userId: string): Promise<LeagueRecord[]> {
  const leagues = await getLeagues();
  return leagues.filter((league) => league.members.some((member) => member.userId === userId));
}

export async function getAllLobbies(): Promise<LobbyRecord[]> {
  if (db) {
    try {
      const snapshot = await getDocs(query(collection(db, 'lobbies'), orderBy('createdAt', 'desc')));
      return snapshot.docs.map((docSnap) => normalizeLobby(docSnap.data(), docSnap.id));
    } catch {
      // fallback below
    }
  }
  return readJson<LobbyRecord[]>(LOBBY_KEY, []);
}

export function getLobbyById(lobbyId: string): Promise<LobbyRecord | null> {
  return getAllLobbies().then((lobbies) => lobbies.find((item) => item.id === lobbyId) ?? null);
}

export function subscribeToLobby(lobbyId: string, callback: (lobby: LobbyRecord | null) => void) {
  if (!db) {
    void getLobbyById(lobbyId).then(callback);
    return () => {};
  }

  return onSnapshot(doc(db, 'lobbies', lobbyId), (snapshot) => {
    callback(snapshot.exists() ? normalizeLobby(snapshot.data(), snapshot.id) : null);
  }, () => {
    void getLobbyById(lobbyId).then(callback);
  });
}

export async function saveLobbies(lobbies: LobbyRecord[]) {
  writeJson(LOBBY_KEY, lobbies);
  if (!db) return;
  const firestore = db;
  try {
    const snapshot = await getDocs(collection(firestore, 'lobbies'));
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(doc(firestore, 'lobbies', docSnap.id))));
    await Promise.all(
      lobbies.map((lobby) =>
        addDoc(collection(firestore, 'lobbies'), {
          id: lobby.id,
          ownerId: lobby.ownerId,
          ownerName: lobby.ownerName,
          gameId: lobby.gameId,
          gameName: lobby.gameName,
          players: lobby.players,
          matches: lobby.matches,
          createdAt: serverTimestamp(),
        }),
      ),
    );
  } catch {
    // keep local state if write fails
  }
}

export async function createLobby(input: { ownerId: string; ownerName: string; role: LeagueRole; gameId?: string; gameName?: string }) {
  const lobby: LobbyRecord = {
    id: `${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    ownerId: input.ownerId,
    ownerName: input.ownerName,
    gameId: input.gameId || 'tictacroll',
    gameName: input.gameName || 'Tic Tac Roll',
    players: [{ id: input.ownerId, name: input.ownerName, role: input.role }],
    matches: [],
    createdAt: new Date().toISOString(),
  };

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'lobbies'), {
        ...lobby,
        createdAt: serverTimestamp(),
      });
      return { ...lobby, id: docRef.id };
    } catch {
      // fall through to local persistence below
    }
  }

  const lobbies = readJson<LobbyRecord[]>(LOBBY_KEY, []);
  writeJson(LOBBY_KEY, [lobby, ...lobbies]);
  return lobby;
}

export async function joinLobby(lobbyId: string, participant: { userId: string; name: string; role: LeagueRole }) {
  const lobbies = await getAllLobbies();
  const lobby = lobbies.find((item) => item.id === lobbyId);
  if (!lobby) return null;
  const alreadyJoined = lobby.players.some((player) => player.id === participant.userId);
  if (alreadyJoined) return lobby;
  const updated = { ...lobby, players: [...lobby.players, { id: participant.userId, name: participant.name, role: participant.role }] };

  if (db) {
    try {
      await updateDoc(doc(db, 'lobbies', lobbyId), {
        players: updated.players,
      });
      return updated;
    } catch {
      // fall through below
    }
  }

  const next = lobbies.map((item) => (item.id === lobbyId ? updated : item));
  writeJson(LOBBY_KEY, next);
  return updated;
}

export async function recordLobbyResult(lobbyId: string, result: { playerId: string; playerName: string; score: number; accuracy: number; role: LeagueRole }) {
  const lobbies = await getAllLobbies();
  const lobby = lobbies.find((item) => item.id === lobbyId);
  if (!lobby) return null;
  const match = {
    ...result,
    createdAt: new Date().toISOString(),
  };
  const updated = {
    ...lobby,
    matches: [match, ...lobby.matches].slice(0, 20),
  };

  if (db) {
    try {
      await updateDoc(doc(db, 'lobbies', lobbyId), {
        matches: updated.matches,
      });
      return updated;
    } catch {
      // fall through below
    }
  }

  const next = lobbies.map((item) => (item.id === lobbyId ? updated : item));
  writeJson(LOBBY_KEY, next);
  return updated;
}

export async function removeLobby(lobbyId: string) {
  if (db) {
    try {
      await deleteDoc(doc(db, 'lobbies', lobbyId));
    } catch {
      // fall through to local delete below
    }
  }
  const lobbies = (await getAllLobbies()).filter((item) => item.id !== lobbyId);
  writeJson(LOBBY_KEY, lobbies);
  return lobbies;
}
