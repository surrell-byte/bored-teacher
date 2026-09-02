import { isCreatorUser } from '@/lib/firebase';

export const COMING_SOON_GAME_IDS = new Set([
  'animalAdventureRace',
  'archersduel',
  'blockfight',
  'bubblepop',
  'crimsonduel',
  'deepseaReveal',
  'dragonslingshot',
  'feedmonster',
  'fishingnumbers',
  'swampjump',
  'hiddencolours',
  'lakersracer',
  'monkeytree',
  'monsterbound',
  'neonbridge',
  'pacman',
  'picturerace',
  'tankwars',
  'unicorn',
  'superwings',
  'pluralquest',
  'quiztrail',
  'shuttlecock',
  'tonguetwister',
  'treasurechest',
  'victoryvet',
  'volcanoracer',
  'wgrandprix',
  'warriors',
  'wordfusion',
]);

export function canAccessGame(gameId: string, user: Parameters<typeof isCreatorUser>[0]) {
  return !COMING_SOON_GAME_IDS.has(gameId) || isCreatorUser(user);
}
