import { GameDefinition, GameConfig, GameInstance } from "./types";

export class GameRegistry {
  private games: Map<string, GameDefinition> = new Map();

  register(game: GameDefinition): void {
    if (!game.config?.id) {
      throw new Error("Game config must have an id");
    }

    this.games.set(game.config.id, game);
  }

  getGame(id: string): GameDefinition | undefined {
    return this.games.get(id);
  }

  getGames(): GameDefinition[] {
    return Array.from(this.games.values());
  }

  getGameConfigs(): GameConfig[] {
    return this.getGames().map((game) => game.config);
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

export function registerGame(game: GameDefinition): void {
  gameRegistry.register(game);
}

export function getGame(id: string): GameDefinition | undefined {
  return gameRegistry.getGame(id);
}

export function getGames(): GameDefinition[] {
  return gameRegistry.getGames();
}

export function getGameRegistry(): GameRegistry {
  return gameRegistry;
}
