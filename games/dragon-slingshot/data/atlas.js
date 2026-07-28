import { Animation } from '../engine/Animation';
import { Sprite } from '../engine/Sprite';

export const ATLAS_URL = '/assets/games/dragon-slingshot/dragon-slingshot-sprite-atlas-1.webp';

// The supplied atlas is a 1.5× labelled export. These source rectangles target
// the actual artwork cells, leaving the title and legend areas out of gameplay.
const DRAGON_STRIPS = {
  red: { x: 111, y: 39 },
  blue: { x: 111, y: 346 },
  green: { x: 111, y: 646 },
};
const ROWS = { idle: 0, fly: 1, attack: 2, hit: 3, die: 4 };
const CELL = { w: 95, h: 61 };

export const dragonAtlasKey = id => ({ ember: 'red', frost: 'blue', storm: 'blue', shadow: 'green', nature: 'green' }[id] ?? 'red');
export const dragonAnimation = new Animation({ frames: 6, fps: 12 });

export function createDragonSprite(image, dragonId, state = 'idle') {
  const strip = DRAGON_STRIPS[dragonAtlasKey(dragonId)];
  return new Sprite(image, { x: strip.x, y: strip.y + ROWS[state] * 61, frameWidth: CELL.w, frameHeight: CELL.h, frames: state === 'hit' ? 4 : 6, scale: .72 });
}

export function createAtlasSprites(image) {
  return {
    goblin: new Sprite(image, { x: 850, y: 38, frameWidth: 79, frameHeight: 68, scale: .65 }),
    boss: new Sprite(image, { x: 1135, y: 289, frameWidth: 120, frameHeight: 162, scale: .56 }),
    tower: new Sprite(image, { x: 850, y: 289, frameWidth: 93, frameHeight: 162, scale: .52 }),
    explosion: new Sprite(image, { x: 1118, y: 646, frameWidth: 94, frameHeight: 66, scale: .46 }),
  };
}
