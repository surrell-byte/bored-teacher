import { RegisteredGame, GameConfig, GameInstance } from "./types";

export class GameRegistry {
  private games: Map<string, RegisteredGame> = new Map();

  register(game: RegisteredGame): void {
    if (!game.config.id) {
      throw new Error("Game config must have an id");
    }
    this.games.set(game.config.id, game);
  }

  getGame(id: string): RegisteredGame | undefined {
    return this.games.get(id);
  }

  getAllGames(): RegisteredGame[] {
    return Array.from(this.games.values());
  }

  getGameConfigs(): GameConfig[] {
    return Array.from(this.games.values()).map((game) => game.config);
  }

  createGame(id: string): GameInstance | Promise<GameInstance> {
    const game = this.games.get(id);
    if (!game) {
      throw new Error(`Game with id "${id}" not found in registry`);
    }
    return game.create();
  }

  hasGame(id: string): boolean {
    return this.games.has(id);
  }
}

export const gameRegistry = new GameRegistry();

export function registerGame(game: RegisteredGame): void {
  gameRegistry.register(game);
}

export function getGameRegistry(): GameRegistry {
  return gameRegistry;
}
