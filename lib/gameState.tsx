'use client';

    // lib/gameState.tsx — Global state context for ESL Game Hub

    import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
    import { auth, onAuthStateChanged, saveUserState, loadUserState } from '@/lib/firebase';
    import { GAME_KEYS } from '@/constants/index';
    import { getEarnedIds, getNewlyUnlocked, type Achievement } from '@/features/achievements/achievements';
    import { syncCurrentPlayerToLeaderboard } from '@/features/leaderboard/api';

    // ── Types ─────────────────────────────────────────────────────

    export interface GameRecord {
      highScore: number;
      completions: number;
      lastAccuracy: number;
      totalQuestions: number;
    }

    export type Role = 'teacher' | 'student' | null;

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
      classId: string;
      role: Role;
      games: Record<string, GameRecord>;
      /** ISO timestamp of when each achievement id was first earned. */
      earnedAt: Record<string, string>;
    }

    const DEFAULT_GAME: GameRecord = { highScore: 0, completions: 0, lastAccuracy: 0, totalQuestions: 100 };

    const DEFAULT_STATE: HubState = {
      name: 'Explorer', username: '', avatar: '👤', theme: 'chalkboard',
      sound: true, lastGame: null,
      xp: 0, level: 1, coins: 0, lastLogin: '', loginStreak: 0,
      classId: '', role: null,
      games: Object.fromEntries(GAME_KEYS.map(k => [k, { ...DEFAULT_GAME }])),
      earnedAt: {},
    };

    const LOCAL_KEY = 'eslhub_data';
    const BACKUP_KEY = 'eslhub_data_backup';

    // ── Context ───────────────────────────────────────────────────

    interface GameContextValue {
      state: HubState;
      setState: (patch: Partial<HubState>) => void;
      updateGameStats: (gameId: string, stats: Partial<GameRecord>) => void;
      addXP: (amount: number) => void;
      completeGame: (
        gameId: string,
        accuracy: number,
        totalQuestions: number,
        xp?: number,
        coins?: number
      ) => void;
      applyTheme: (theme: string) => void;
      showToast: (msg: string) => void;
      toast: string;
      checkDailyReward: () => void;
      earnedAchievementIds: Set<string>;
      pendingAchievement: Achievement | null;
      clearPendingAchievement: () => void;
    }

    const GameContext = createContext<GameContextValue | null>(null);

    // ── XP helpers ────────────────────────────────────────────────

    export function xpForLevel(lvl: number) { return lvl * 100; }

    // ── Auth helper ───────────────────────────────────────────────

    export async function logOut() {
      const { signOut: fbSignOut } = await import('@/lib/firebase');
      await fbSignOut();
    }

    // ── Provider ──────────────────────────────────────────────────

    function loadLocal(): HubState {
      try {
        const saved = localStorage.getItem(LOCAL_KEY);
        const backup = localStorage.getItem(BACKUP_KEY);
        const parsed = saved ? normalizeState(JSON.parse(saved)) : DEFAULT_STATE;
        const parsedBackup = backup ? normalizeState(JSON.parse(backup)) : null;
        return parsedBackup && isRicherState(parsedBackup, parsed) ? parsedBackup : parsed;
      } catch { return DEFAULT_STATE; }
    }

    function normalizeState(value: Partial<HubState>): HubState {
      return {
        ...DEFAULT_STATE,
        ...value,
        games: { ...DEFAULT_STATE.games, ...(value.games || {}) },
        earnedAt: { ...(value.earnedAt || {}) },
      };
    }

    function totalXp(state: Partial<HubState>) {
      const level = state.level || 1;
      let total = state.xp || 0;
      for (let lvl = 1; lvl < level; lvl++) total += xpForLevel(lvl);
      return total;
    }

    function progressScore(state: Partial<HubState>) {
      const games = state.games || {};
      return Object.values(games).reduce((sum, game) => {
        return sum + (game?.highScore || 0) + (game?.completions || 0) * 25;
      }, totalXp(state) + (state.coins || 0));
    }

    function isRicherState(candidate: HubState, current: HubState) {
      return progressScore(candidate) > progressScore(current);
    }

    function backupLocalState() {
      try {
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved && progressScore(JSON.parse(saved)) > 0) {
          localStorage.setItem(BACKUP_KEY, saved);
        }
      } catch {}
    }

    function chooseProfileValue(remoteValue: string | undefined, localValue: string, defaultValue: string) {
      if (localValue && localValue !== defaultValue) return localValue;
      return remoteValue || localValue;
    }

    /** Merge two earnedAt maps, keeping the earliest recorded date for any id present in both. */
    function mergeEarnedAt(
      local: Record<string, string> = {},
      remote: Record<string, string> = {}
    ): Record<string, string> {
      const merged: Record<string, string> = { ...remote, ...local };
      for (const id of Object.keys(merged)) {
        if (local[id] && remote[id]) {
          merged[id] = local[id] < remote[id] ? local[id] : remote[id];
        }
      }
      return merged;
    }

    function mergeRemote(local: HubState, remote: Partial<HubState>): HubState {
      const localTotalXp = totalXp(local);
      const remoteTotalXp = totalXp(remote);
      const useRemoteXp = remoteTotalXp > localTotalXp;

      const merged: HubState = {
        ...local,
        name:        chooseProfileValue(remote.name, local.name, DEFAULT_STATE.name),
        username:    chooseProfileValue(remote.username, local.username, DEFAULT_STATE.username),
        avatar:      chooseProfileValue(remote.avatar, local.avatar, DEFAULT_STATE.avatar),
        theme:       chooseProfileValue(remote.theme, local.theme, DEFAULT_STATE.theme),
        xp:          useRemoteXp ? (remote.xp ?? local.xp) : local.xp,
        level:       useRemoteXp ? (remote.level ?? local.level) : local.level,
        coins:       Math.max(local.coins || 0, remote.coins || 0),
        loginStreak: Math.max(local.loginStreak || 0, remote.loginStreak || 0),
        lastGame:    remote.lastGame    || local.lastGame,
        lastLogin:   remote.lastLogin   || local.lastLogin,
        sound:       remote.sound       !== undefined ? remote.sound : local.sound,
        classId:     remote.classId || local.classId,
        role:        remote.role ?? local.role,
        games:       { ...DEFAULT_STATE.games },
        earnedAt:    mergeEarnedAt(local.earnedAt, remote.earnedAt),
      };
      const allKeys = new Set([...Object.keys(local.games), ...Object.keys(remote.games ||{})]);
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
      const stateRef              = useRef<HubState>(state);

      useEffect(() => { stateRef.current = state; }, [state]);

      // Achievement tracking — derived from state, never persisted
      // (earnedAt IS persisted, as part of HubState, once stamped below)
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

      /**
       * Call after any state mutation that could unlock achievements.
       * Returns `next`, patched with earnedAt timestamps for any newly-unlocked
       * achievement — callers should persist and return THIS value, not the
       * original `next`, so the date is actually saved.
       */
      function stampAchievements(prev: HubState, next: HubState): HubState {
        const before = getEarnedIds(prev);
        const after  = getEarnedIds(next);
        setEarnedIds(after);
        const newOnes = getNewlyUnlocked(before, after);
        if (newOnes.length === 0) return next;

        const now = new Date().toISOString();
        const earnedAt = { ...next.earnedAt };
        for (const a of newOnes) earnedAt[a.id] = now;

        achievementQueue.current.push(...newOnes);
        drainQueue();

        return { ...next, earnedAt };
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
          backupLocalState();
          const local = loadLocal();
          if (remote) {
            const merged  = mergeRemote(local, remote as Partial<HubState>);
            localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
            saveUserState(user.uid, merged).catch(() => {});
            setStateRaw(merged);
            applyThemeClass(merged.theme);
            setEarnedIds(getEarnedIds(merged));
          } else if (progressScore(local) > 0) {
            saveUserState(user.uid, local).catch(() => {});
          }
        });
        return unsub;
      }, []);

      // Flush any pending debounced Firestore write immediately —
      // covers tab close, navigation away, app backgrounding on mobile
      useEffect(() => {
        function flushPending() {
          if (fbTimerRef.current && uidRef.current) {
            clearTimeout(fbTimerRef.current);
            fbTimerRef.current = null;
            saveUserState(uidRef.current, stateRef.current).catch(() => {});
          }
        }
        function onVisibilityChange() {
          if (document.visibilityState === 'hidden') flushPending();
        }
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('pagehide', flushPending);
        return () => {
          document.removeEventListener('visibilitychange', onVisibilityChange);
          window.removeEventListener('pagehide', flushPending);
        };
      }, []);

      function persist(s: HubState) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
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
          const merged = { ...prev, ...patch };
          const next = stampAchievements(prev, merged);
          persist(next);
          return next;
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const updateGameStats = useCallback((gameId: string, stats: Partial<GameRecord>) => {
        setStateRaw(prev => {
          const merged = {
            ...prev,
            games: { ...prev.games, [gameId]: { ...(prev.games[gameId] || DEFAULT_GAME), ...stats } },
          };
          const next = stampAchievements(prev, merged);
          persist(next);
          return next;
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const addXP = useCallback((amount: number) => {
        setStateRaw(prev => {
          let newXp    = prev.xp + amount;
          let newLevel = prev.level;
          while (newXp >= xpForLevel(newLevel)) {
            newXp -= xpForLevel(newLevel);
            newLevel++;
          }
          const merged = { ...prev, xp: newXp, level: newLevel };
          const next = stampAchievements(prev, merged);
          persist(next);
          return next;
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const completeGame = useCallback((
        gameId: string,
        accuracy: number,
        totalQuestions: number,
        xp = accuracy,
        coins = Math.floor(accuracy / 2)
      ) => {
        setStateRaw(prev => {
          const current = prev.games[gameId] || DEFAULT_GAME;
          let newXp = prev.xp + xp;
          let newLevel = prev.level;

          while (newXp >= xpForLevel(newLevel)) {
            newXp -= xpForLevel(newLevel);
            newLevel++;
          }

          const merged = {
            ...prev,
            xp: newXp,
            level: newLevel,
            coins: prev.coins + coins,
            lastGame: gameId,
            games: {
              ...prev.games,
              [gameId]: {
                ...current,
                highScore: Math.max(current.highScore, accuracy),
                completions: current.completions + 1,
                lastAccuracy: accuracy,
                totalQuestions
              }
            }
          };

          const next = stampAchievements(prev, merged);
          persist(next);
          try { syncCurrentPlayerToLeaderboard(); } catch {}

          setTimeout(() => {
            showToast(`🏆 ${accuracy}% | +${xp} XP | +${coins} coins`);
          }, 100);

          return next;
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const merged = { ...prev, coins: prev.coins + coins, lastLogin: today, loginStreak: streak };
          const next = stampAchievements(prev, merged);
          persist(next);
          setTimeout(() => showToast(`🎁 Daily reward: +${coins} coins! Come back tomorrow for more.`), 300);
          return next;
        });
      }, [showToast]);

      return (
        <GameContext.Provider value={{ state, setState, updateGameStats, addXP, completeGame, applyTheme, showToast, toast, checkDailyReward, earnedAchievementIds, pendingAchievement, clearPendingAchievement }}>
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
      document.body.classList.forEach(cls => {
        if (cls.startsWith('theme-')) document.body.classList.remove(cls);
      });
      document.body.classList.add(`theme-${theme}`);
    }