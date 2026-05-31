'use client';
// lib/gameState.tsx — Global state context for ESL Game Hub

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { auth, onAuthStateChanged, saveUserState, loadUserState } from '@/lib/firebase';
import { GAME_KEYS } from '@/lib/constants';
import { getEarnedIds, getNewlyUnlocked, type Achievement } from '@/lib/achievements';

// ── Types ─────────────────────────────────────────────────────

export interface GameRecord {
  highScore: number;
  completions: number;
  lastAccuracy: number;
  totalQuestions: number;
}

export interface HubState {
  name: string;
  username: string;
  avatar: string;
  theme: string;
  sound: boolean;
  lastGame: string | null;
  xp: number;
  level: number;
  coins: number;
  lastLogin: string;
  loginStreak: number;
  games: Record<string, GameRecord>;
}

const DEFAULT_GAME: GameRecord = { highScore: 0, completions: 0, lastAccuracy: 0, totalQuestions: 100 };

const DEFAULT_STATE: HubState = {
  name: 'Explorer', username: '', avatar: '👤', theme: 'chalkboard',
  sound: true, lastGame: null,
  xp: 0, level: 1, coins: 0, lastLogin: '', loginStreak: 0,
  games: Object.fromEntries(GAME_KEYS.map(k => [k, { ...DEFAULT_GAME }])),
};

// ── Context ───────────────────────────────────────────────────

interface GameContextValue {
  state: HubState;
  setState: (patch: Partial<HubState>) => void;
  updateGameStats: (gameId: string, stats: Partial<GameRecord>) => void;
  addXP: (amount: number) => void;
  applyTheme: (theme: string) => void;
  showToast: (msg: string) => void;
  toast: string;
  checkDailyReward: () => void;
  // Achievements — derived, never stored
  earnedAchievementIds: Set<string>;
  pendingAchievement: Achievement | null;
  clearPendingAchievement: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// ── XP helpers ────────────────────────────────────────────────

export function xpForLevel(lvl: number) { return lvl * 100; }

// ── Auth helper ───────────────────────────────────────────────

export async function logOut() {
  const { logOut: fbLogOut } = await import('@/lib/firebase');
  await fbLogOut();
}

// ── Provider ──────────────────────────────────────────────────

function loadLocal(): HubState {
  try {
    const saved = localStorage.getItem('eslhub_data');
    if (!saved) return DEFAULT_STATE;
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      games: { ...DEFAULT_STATE.games, ...parsed.games },
    };
  } catch { return DEFAULT_STATE; }
}

function mergeRemote(local: HubState, remote: Partial<HubState>): HubState {
  const merged: HubState = {
    ...local,
    name:        remote.name        || local.name,
    username:    remote.username    || local.username,
    avatar:      remote.avatar      || local.avatar,
    theme:       remote.theme       || local.theme,
    xp:          remote.xp          ?? local.xp,
    level:       remote.level       ?? local.level,
    coins:       remote.coins       ?? local.coins,
    loginStreak: remote.loginStreak ?? local.loginStreak,
    lastGame:    remote.lastGame    || local.lastGame,
    lastLogin:   remote.lastLogin   || local.lastLogin,
    sound:       remote.sound       !== undefined ? remote.sound : local.sound,
    games:       { ...DEFAULT_STATE.games },
  };
  const allKeys = new Set([...Object.keys(local.games), ...Object.keys(remote.games || {})]);
  for (const k of allKeys) {
    const l = local.games[k] || DEFAULT_GAME;
    const r = (remote.games || {})[k] || DEFAULT_GAME;
    merged.games[k] = {
      highScore:     Math.max(l.highScore || 0,     r.highScore || 0),
      completions:   Math.max(l.completions || 0,   r.completions || 0),
      lastAccuracy:  l.lastAccuracy || r.lastAccuracy || 0,
      totalQuestions: l.totalQuestions || r.totalQuestions || 100,
    };
  }
  return merged;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw]  = useState<HubState>(DEFAULT_STATE);
  const [toast, setToast]     = useState('');
  const toastTimerRef         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fbTimerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uidRef                = useRef<string | null>(null);

  // Achievement tracking — derived from state, never persisted
  const [earnedAchievementIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [pendingAchievement, setPending]      = useState<Achievement | null>(null);
  const achievementQueue                      = useRef<Achievement[]>([]);
  const showingAchievement                    = useRef(false);

  function drainQueue() {
    if (showingAchievement.current || achievementQueue.current.length === 0) return;
    showingAchievement.current = true;
    setPending(achievementQueue.current.shift()!);
  }

  function clearPendingAchievement() {
    setPending(null);
    showingAchievement.current = false;
    // Small delay so the closing animation plays before the next popup
    setTimeout(drainQueue, 200);
  }

  /** Call after any state mutation that could unlock achievements. */
  function checkAchievements(prev: HubState, next: HubState) {
    const before = getEarnedIds(prev);
    const after  = getEarnedIds(next);
    setEarnedIds(after);
    const newOnes = getNewlyUnlocked(before, after);
    if (newOnes.length > 0) {
      achievementQueue.current.push(...newOnes);
      drainQueue();
    }
  }

  // Load from localStorage once on mount (client only)
  useEffect(() => {
    const s = loadLocal();
    setStateRaw(s);
    applyThemeClass(s.theme);
    setEarnedIds(getEarnedIds(s));
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) { uidRef.current = null; return; }
      uidRef.current = user.uid;
      const remote = await loadUserState(user.uid);
      if (remote) {
        const local   = loadLocal();
        const merged  = mergeRemote(local, remote as Partial<HubState>);
        localStorage.setItem('eslhub_data', JSON.stringify(merged));
        setStateRaw(merged);
        applyThemeClass(merged.theme);
        setEarnedIds(getEarnedIds(merged));
      }
    });
    return unsub;
  }, []);

  function persist(s: HubState) {
    localStorage.setItem('eslhub_data', JSON.stringify(s));
    // Debounced Firestore write
    if (uidRef.current) {
      if (fbTimerRef.current) clearTimeout(fbTimerRef.current);
      fbTimerRef.current = setTimeout(() => {
        if (uidRef.current) saveUserState(uidRef.current, s).catch(() => {});
      }, 2000);
    }
  }

  const setState = useCallback((patch: Partial<HubState>) => {
    setStateRaw(prev => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const updateGameStats = useCallback((gameId: string, stats: Partial<GameRecord>) => {
    setStateRaw(prev => {
      const next = {
        ...prev,
        games: { ...prev.games, [gameId]: { ...(prev.games[gameId] || DEFAULT_GAME), ...stats } },
      };
      persist(next);
      checkAchievements(prev, next);
      return next;
    });
  }, []);

  const addXP = useCallback((amount: number) => {
    setStateRaw(prev => {
      let newXp    = prev.xp + amount;
      let newLevel = prev.level;
      while (newXp >= xpForLevel(newLevel)) {
        newXp -= xpForLevel(newLevel);
        newLevel++;
      }
      const next = { ...prev, xp: newXp, level: newLevel };
      persist(next);
      checkAchievements(prev, next);
      return next;
    });
  }, []);

  const applyTheme = useCallback((theme: string) => {
    applyThemeClass(theme);
    setState({ theme });
  }, [setState]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 3500);
  }, []);

  const checkDailyReward = useCallback(() => {
    setStateRaw(prev => {
      const today     = new Date().toDateString();
      const yesterday = new Date(Date.now() - 864e5).toDateString();
      if (prev.lastLogin === today) return prev;
      const coins  = 50 + (prev.level - 1) * 10;
      const streak = prev.lastLogin === yesterday ? (prev.loginStreak || 0) + 1 : 1;
      const next   = { ...prev, coins: prev.coins + coins, lastLogin: today, loginStreak: streak };
      persist(next);
      checkAchievements(prev, next);
      setTimeout(() => showToast(`🎁 Daily reward: +${coins} coins! Come back tomorrow for more.`), 300);
      return next;
    });
  }, [showToast]);

  return (
    <GameContext.Provider value={{ state, setState, updateGameStats, addXP, applyTheme, showToast, toast, checkDailyReward, earnedAchievementIds, pendingAchievement, clearPendingAchievement }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

// ── Theme helper ──────────────────────────────────────────────

function applyThemeClass(theme: string) {
  if (typeof document === 'undefined') return;
  const body = document.body;
  body.className = body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
  body.classList.add(`theme-${theme}`);
  localStorage.setItem('esl_theme', theme);
}