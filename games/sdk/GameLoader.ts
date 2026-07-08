import { GameRegistry, gameRegistry } from "./GameRegistry";
import { GameInstance, GameConfig } from "./types";

export class GameLoader {
  private registry: GameRegistry;

  constructor(registry?: GameRegistry) {
    this.registry = registry || gameRegistry;
  }

  async loadGame(gameId: string): Promise<GameInstance> {
    const instance = this.registry.createGame(gameId);
    return instance instanceof Promise ? await instance : instance;
  }

  getAvailableGames(): GameConfig[] {
    return this.registry.getGameConfigs();
  }

  isGameAvailable(gameId: string): boolean {
    return this.registry.hasGame(gameId);
  }

  async preloadGame(gameId: string): Promise<void> {
    try {
      await this.loadGame(gameId);
    } catch (error) {
      console.error(`Failed to preload game ${gameId}:`, error);
    }
  }
}

export const gameLoader = new GameLoader();
