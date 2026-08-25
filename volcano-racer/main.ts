import { Engine } from '../../engine/core/Engine';

import { WelcomeScene } from './scenes/WelcomeScene';
import { SetupScene } from './scenes/SetupScene';
import { CarSelectScene } from './scenes/CarSelectScene';
import { RaceScene } from './scenes/RaceScene';
import { VictoryScene } from './scenes/VictoryScene';
import { RaceGameState } from './state/RaceState';
import { CANVAS_W, CANVAS_H } from './config';

/**
 * Volcano Racer — a card-driven kart race.
 * No sprite sheet: every visual (cars, track, lava sky) is drawn with
 * canvas primitives in draw/CarIcon.ts and draw/Theme.ts, so this game
 * runs with zero image assets.
 */
export async function startGame(parent: HTMLElement) {
  const engine = new Engine({
    width: CANVAS_W,
    height: CANVAS_H,
    parent,
    backgroundColor: '#1a0d0a',
  });

  // One shared state object travels through every screen.
  const state = new RaceGameState();

  engine.scenes.register('welcome', new WelcomeScene());
  engine.scenes.register('setup', new SetupScene(state));
  engine.scenes.register('car-select', new CarSelectScene(state));
  engine.scenes.register('race', new RaceScene(state));
  engine.scenes.register('victory', new VictoryScene(state));

  engine.scenes.goto('welcome');

  engine.start();

  return engine;
}
