// lib/leaderboard.ts — Leaderboard persistence & scoring helpers

import { loadAllStudentScores } from '@/lib/firebase';

const LB_KEY  = 'eslhub_leaderboard';

export const GAME_KEYS = [
  'unicorn','warriors','compound','animal','wordmatch','memory','missingfruit',
  'animalclass','colourclash','compoundword','crimsonduel','deepseaReveal',
  'emojimatch','emojispelling','familyquest','farmgame','findmyfood',
  'flagmaster','foodwordhunt','fruitwordhunt','lakersracer','neonbridge','oceanquest',
  'pacman','phonicsadventure','phonicsworld','shuttlecock','tornado','wgrandprix','wordfusion',
];

export interface LBPlayer {
  id: string;
  name: string;
  addedAt: string;
  games: Record<string, { best: number; played: number }>;
}

export interface LBPlayerWithScore extends LBPlayer {
  score: { total: number; avg: number; gamesPlayed: number };
}

export interface Leaderboard {
  players: LBPlayer[];
}

export function loadLeaderboard(): Leaderboard {
  try {
    const saved = localStorage.getItem(LB_KEY);
    return saved ? JSON.parse(saved) : { players: [] };
  } catch { return { players: [] }; }
}

export function saveLeaderboard(lb: Leaderboard) {
  localStorage.setItem(LB_KEY, JSON.stringify(lb));
}

export function getPlayerScore(player: LBPlayer) {
  let total = 0, count = 0;
  for (const gk of GAME_KEYS) {
    const best = player.games?.[gk]?.best || 0;
    if (best > 0) { total += best; count++; }
  }
  return { total, avg: count > 0 ? Math.round(total / count) : 0, gamesPlayed: count };
}

export function getSortedLeaderboard(): LBPlayerWithScore[] {
  const lb = loadLeaderboard();
  return lb.players
    .map(p => ({ ...p, score: getPlayerScore(p) }))
    .sort((a, b) => b.score.total - a.score.total);
}

// ── Class-scoped leaderboard, sourced from Firestore studentScores ──
export async function getSortedClassLeaderboard(classId: string): Promise<LBPlayerWithScore[]> {
  if (!classId) return [];
  const docs = await loadAllStudentScores(classId);
  return docs
    .filter((d: any) => d.name && d.name !== 'Explorer')
    .map((d: any) => {
      const games = d.games || {};
      let total = 0, count = 0;
      for (const gk of GAME_KEYS) {
        const best = games[gk]?.best || 0;
        if (best > 0) { total += best; count++; }
      }
      return {
        id: d.uid,
        name: d.name,
        addedAt: '',
        games,
        score: { total, avg: count > 0 ? Math.round(total / count) : 0, gamesPlayed: count },
      } as LBPlayerWithScore;
    })
    .sort((a, b) => b.score.total - a.score.total);
}

export function addPlayersToLeaderboard(names: string[]): number {
  const lb = loadLeaderboard();
  let added = 0;
  for (const rawName of names) {
    const name = rawName.trim();
    if (!name || name.length < 2) continue;
    if (lb.players.some(p => p.name.toLowerCase() === name.toLowerCase())) continue;
    lb.players.push({
      id:      `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      addedAt: new Date().toISOString().slice(0, 10),
      games:   {},
    });
    added++;
  }
  saveLeaderboard(lb);
  return added;
}

export function removePlayer(id: string) {
  const lb   = loadLeaderboard();
  lb.players = lb.players.filter(p => p.id !== id);
  saveLeaderboard(lb);
}

export function clearLeaderboard() {
  saveLeaderboard({ players: [] });
}

export function syncCurrentPlayerToLeaderboard() {
  try {
    const data = localStorage.getItem('eslhub_data');
    if (!data) return;
    const hubState = JSON.parse(data);
    const name = hubState.name;
    if (!name || name === 'Explorer') return;
    const lb     = loadLeaderboard();
    const player = lb.players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!player) return;
    for (const gk of GAME_KEYS) {
      const g = hubState.games?.[gk];
      if (!g) continue;
      if (!player.games[gk]) player.games[gk] = { played: 0, best: 0 };
      player.games[gk].played = Math.max(player.games[gk].played || 0, g.completions || 0);
      player.games[gk].best   = Math.max(player.games[gk].best   || 0, g.highScore   || 0);
    }
    saveLeaderboard(lb);
  } catch (_) {}
}

export function parseCSVToNames(text: string): string[] {
  return text.split(/\r?\n/).map(line => line.split(',')[0].replace(/"/g, '').trim()).filter(Boolean);
}

export function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
