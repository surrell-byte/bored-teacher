'use client';
// games/catalog.components.tsx
// The React-component half of the game catalog. Kept SEPARATE from
// catalog.data.ts because dynamic import() paths must be literal strings
// for the bundler to find them — they can't be generated from data.
//
// Every id in here MUST also exist in GAME_CATALOG (catalog.data.ts) with
// hasComponent: true. Run `npm run check-games` to verify.
// Legacy iframe games (hasComponent: false) are NOT listed here — they're
// rendered via GAME_URLS + an <iframe> instead.

import { lazy } from 'react';

export type GameComponentProps = {
  onComplete: (score: number, accuracy: number) => void;
};

export const GAME_COMPONENTS: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<GameComponentProps>>
> = {
  quiztrail: lazy(() => import('@/games/quiz-trail/QuizTrail')),
  unicorn: lazy(() => import('@/games/unicorn-run/UnicornRun.jsx')),
  warriors: lazy(() => import('@/games/grammar-hoop-slam/GrammarHoopSlam.jsx')),
  compound: lazy(() => import('@/games/compound-word-quest/CompoundWordQuest.jsx')),
  wordmatch: lazy(() => import('@/games/word-match/WordMatch.jsx')),
  memory: lazy(() => import('@/games/memory-game/MemoryMatch.jsx')),
  missingfruit: lazy(() => import('@/games/missing-fruit/MissingFruit.jsx')),
  animalclass: lazy(() => import('@/games/animal-class-quest/AnimalClassQuest.jsx')),
  colourclash: lazy(() => import('@/games/colour-clash/ColourClash.jsx')),
  crimsonduel: lazy(() => import('@/games/crimson-color-duel/CrimsonColorDuel.jsx')),
  deepseaReveal: lazy(() => import('@/games/deep-sea-reveal/DeepSeaReveal.jsx')),
  emojimatch: lazy(() => import('@/games/emoji-match/EmojiMatch.jsx')),
  emojispelling: lazy(() => import('@/games/emoji-spelling-game/EmojiSpellingMaster.jsx')),
  familyquest: lazy(() => import('@/games/family-quest/FamilyQuest.jsx')),
  farmgame: lazy(() => import('@/games/farm-game/FarmGame.jsx')),
  findmyfood: lazy(() => import('@/games/find-my-food/FindMyFood.jsx')),
  flagmaster: lazy(() => import('@/games/flagmaster/Flagmaster.jsx')),
  foodwordhunt: lazy(() => import('@/games/food-word-hunt/FoodWordHunt.jsx')),
  fruitwordhunt: lazy(() => import('@/games/fruit-word-hunt/FruitWordHunt.jsx')),
  lakersracer: lazy(() => import('@/games/lakers-showtime-racer/LakersShowtimeRacer.jsx')),
  neonbridge: lazy(() => import('@/games/neon-bridge-of-destiny/NeonBridgeOfDestiny.jsx')),
  oceanquest: lazy(() => import('@/games/ocean-quest/OceanQuest.jsx')),
  pacman: lazy(() => import('@/games/pac-man/PacMan.jsx')),
  phonicsadventure: lazy(() => import('@/games/phonics-adventure/PhonicAdventure.jsx')),
  phonicsworld: lazy(() => import('@/games/phonics-world/PhonicWorld.jsx')),
  shuttlecock: lazy(() => import('@/games/shuttlecock-smash/ShuttlecockSmash.jsx')),
  tornado: lazy(() => import('@/games/tornado/Tornado.jsx')),
  wgrandprix: lazy(() => import('@/games/w-grand-prix/WGrandPrix.jsx')),
  connect4: lazy(() => import('@/games/connect-4/Connect4.jsx')),
  monkeytree: lazy(() => import('@/games/monkey-tree-climb/MonkeyTreeClimb.jsx')),
  blockfight: lazy(() => import('@/games/block-fight/BlockFight')),
};
