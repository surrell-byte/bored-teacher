/**
 * Core types for the game SDK
 */

export interface GameState {
  score: number;
  level: number;
  completed: boolean;
  [key: string]: any;
}

export interface GameInstance {
  state: GameState;
  start(): void;
  pause(): void;
  resume(): void;
  end(): void;
  addScore(points: number): void;
  getScore(): number;
}

export interface GameConfig {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  minPlayers?: number;
  maxPlayers?: number;
}

export interface RegisteredGame {
  config: GameConfig;
  create(): GameInstance | Promise<GameInstance>;
}
