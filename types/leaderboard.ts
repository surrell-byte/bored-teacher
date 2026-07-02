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
