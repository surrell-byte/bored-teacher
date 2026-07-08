import { RegisteredGame, GameConfig, GameInstance } from "./types";
import { gameRegistry } from "./GameRegistry";

/**
 * Factory function to create a game
 */
export function createGame(
  config: GameConfig,
  gameFactory: () => GameInstance | Promise<GameInstance>
): RegisteredGame {
  return {
    config,
    create: gameFactory,
  };
}

/**
 * Utility to register and create a game in one step
 */
export function registerAndCreateGame(
  config: GameConfig,
  gameFactory: () => GameInstance | Promise<GameInstance>
): void {
  const game = createGame(config, gameFactory);
  gameRegistry.register(game);
}
