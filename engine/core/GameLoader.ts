import { GameInstance } from "./types";
import { GameRegistry, gameRegistry } from "./GameRegistry";

export class GameLoader {
  private registry: GameRegistry;

  constructor(registry?: GameRegistry) {
    this.registry = registry ?? gameRegistry;
  }

  loadGame(id: string): GameInstance | Promise<GameInstance> {
    const game = this.registry.getGame(id);

    if (!game) {
      throw new Error(`Game ${id} not registered`);
    }

    return game.create();
  }

  getAvailableGames() {
    return this.registry.getGameConfigs();
  }

  isGameAvailable(id: string): boolean {
    return this.registry.hasGame(id);
  }

  async preloadGame(id: string): Promise<void> {
    try {
      await this.loadGame(id);
    } catch (error) {
      console.error(`Failed to preload game ${id}:`, error);
    }
  }
}

export const gameLoader = new GameLoader();

export function loadGame(id: string): GameInstance | Promise<GameInstance> {
  return gameLoader.loadGame(id);
}