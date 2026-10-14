export const COMING_SOON_GAME_IDS = new Set([
  'animalAdventureRace',
  'archersduel',
  'bubblepop',
  'crimsonduel',
  'deepseaReveal',
  'dragonslingshot',
  'feedmonster',
  'fishingnumbers',
  'swampjump',
  'lakersracer',
  'monkeytree',
  'monsterbound',
  'neonbridge',
  'pacman',
  'picturerace',
  'tankwars',
  'powerpointslide',
  'unicorn',
  'turbodash',
  'superwings',
  'pluralquest',
  'quiztrail',
  'shuttlecock',
  'tonguetwister',
  'treasurechest',
  'unicornwings',
  'victoryvet',
  'volcanoracer',
  'wgrandprix',
  'wordfusion',
  'shapebuilder',
]);

export const TEACHER_PRO_GAME_IDS = new Set([
  'compound',
  'descriptiondetective',
  'findtheword',
  'higherorlower',
  'redorblack',
  'wordmatch',
  'oceanquest',
  'parachutedrop',
  'tornado',
  'vocabvalley',
  'tilelanes',
  'snowyslopes',
]);

export function canAccessGame(gameId: string) {
  return !COMING_SOON_GAME_IDS.has(gameId);
}

export function isPublicGame(gameId: string) {
  return canAccessGame(gameId) && !TEACHER_PRO_GAME_IDS.has(gameId);
}
