const enemy = (x, y, type = 'normal', hp = 1) => ({ x, y, type, hp });
const tower = (count, startX, y, width = 22, height = 72) => Array.from({ length: count }, (_, index) => ({ x: startX + index * (width + 8), y, w: width, h: height }));

export const LEVELS = [
  { name: 'Ember Valley', biome: 'volcano', dragons: 3, blocks: [...tower(3, 490, 348, 26, 60), { x: 488, y: 292, w: 120, h: 22 }], enemies: [enemy(540, 270)] },
  { name: 'Frost Peaks', biome: 'ice', dragons: 4, blocks: [...tower(4, 470, 348), { x: 468, y: 272, w: 136, h: 22 }], enemies: [enemy(500, 250), enemy(545, 250)] },
  { name: 'Storm Cliffs', biome: 'storm', dragons: 4, blocks: [...tower(4, 460, 348, 20, 70), { x: 458, y: 277, w: 134, h: 22 }, { x: 510, y: 227, w: 50, h: 52 }], enemies: [enemy(480, 255), enemy(538, 205, 'ptero')] },
  { name: 'Shadow Forest', biome: 'forest', dragons: 5, blocks: [...tower(5, 450, 348, 18, 80), { x: 448, y: 267, w: 152, h: 22 }, { x: 500, y: 217, w: 50, h: 52 }], enemies: [enemy(475, 245), enemy(525, 245), enemy(524, 195)] },
  { name: 'Desert Ruins', biome: 'desert', dragons: 5, blocks: [...tower(5, 440, 348), { x: 438, y: 281, w: 166, h: 20 }, { x: 490, y: 231, w: 80, h: 20 }, { x: 518, y: 181, w: 30, h: 52 }], enemies: [enemy(470, 259), enemy(540, 259), enemy(533, 159)] },
  { name: 'Deep Ocean', biome: 'ocean', dragons: 6, blocks: [...tower(5, 430, 348, 20, 90), { x: 428, y: 257, w: 164, h: 20 }, { x: 470, y: 207, w: 100, h: 20 }, { x: 510, y: 157, w: 40, h: 52 }], enemies: [enemy(460, 235), enemy(510, 235), enemy(560, 235), enemy(530, 135, 'ptero')] },
  { name: 'Sky Citadel', biome: 'sky', dragons: 6, blocks: [...tower(6, 420, 348, 18, 100), { x: 418, y: 247, w: 182, h: 20 }, { x: 470, y: 197, w: 100, h: 20 }, { x: 510, y: 147, w: 60, h: 52 }], enemies: [enemy(450, 225), enemy(510, 225), enemy(570, 225), enemy(540, 175), enemy(536, 125)] },
  { name: 'Lava Core', biome: 'lavacore', dragons: 7, blocks: [...tower(6, 410, 348, 20, 90), { x: 408, y: 257, w: 184, h: 20 }, { x: 450, y: 207, w: 120, h: 20 }, { x: 490, y: 157, w: 80, h: 20 }, { x: 518, y: 107, w: 40, h: 52 }], enemies: [enemy(450, 235), enemy(510, 235), enemy(570, 235), enemy(530, 185), enemy(558, 85)] },
  { name: 'Crystal Caves', biome: 'crystal', dragons: 7, blocks: [...tower(7, 400, 348, 18, 100), { x: 398, y: 247, w: 196, h: 18 }, { x: 440, y: 197, w: 130, h: 18 }, { x: 476, y: 147, w: 90, h: 18 }, { x: 508, y: 97, w: 50, h: 52 }], enemies: [enemy(440, 227), enemy(500, 227), enemy(560, 227), enemy(505, 177), enemy(533, 75)] },
  { name: "Dragon Lord's Lair", biome: 'boss', dragons: 10, blocks: [...tower(7, 400, 348, 18, 100), { x: 398, y: 247, w: 196, h: 18 }, { x: 440, y: 197, w: 130, h: 18 }, { x: 476, y: 147, w: 90, h: 18 }], enemies: [enemy(440, 227), enemy(500, 227), enemy(560, 227), enemy(505, 177), enemy(490, 110, 'boss', 500)] },
];
