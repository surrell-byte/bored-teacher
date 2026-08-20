'use client';
// games/catalog.components.tsx
// The React-component half of the game catalog. Kept SEPARATE from
// catalog.data.ts because dynamic import() paths must be literal strings
// for the bundler to find them — they can't be generated from data.
//
// Every id in here MUST also exist in GAME_CATALOG (catalog.data.ts) with
// hasComponent: true. Run `npm run check-games` to verify.
// Every published game is loaded here as a React component. The older HTML
// originals have been replaced by the shared React gameplay ports below.

import { lazy } from 'react';

export type GameComponentProps = {
  onComplete: (score: number, accuracy: number) => void;
  onHudUpdate?: (hud: any) => void;
  [key: string]: unknown;
};

export const GAME_COMPONENTS: Partial<Record<string, React.LazyExoticComponent<React.ComponentType<any>>>> = {
  tilebattle: lazy(() => import('@/games/tile-battle/TileBattle')),
  quiztrail: lazy(() => import('@/games/quiz-trail/QuizTrail')),
  unicorn: lazy(() => import('@/games/unicorn-run/UnicornRun.jsx')),
  warriors: lazy(() => import('@/games/grammar-hoop-slam/GrammarHoopSlam.jsx')),
  compound: lazy(() => import('@/games/compound-word-quest/CompoundWordQuest.jsx')),
  wordmatch: lazy(() => import('@/games/word-match/WordMatch.jsx')),
  memory: lazy(() => import('@/games/memory-game/MemoryMatch.jsx')),
  missingfruit: lazy(() => import('@/games/missing-fruit/MissingFruit.jsx')),
  animalclass: lazy(() => import('@/games/animal-class-quest/AnimalClassQuest.jsx')),
  colourclash: lazy(() => import('@/games/colour-clash/ColourClash.jsx')),
  hiddencolours: lazy(() => import('@/games/hidden-colours/HiddenColours.jsx')),
  crimsonduel: lazy(() => import('@/games/crimson-color-duel/CrimsonColorDuel.jsx')),
  archersduel: lazy(() => import('@/games/archers-duel/ArchersDuel.jsx')),
  deepseaReveal: lazy(() => import('@/games/deep-sea-reveal/DeepSeaReveal.jsx')),
  dragonslingshot: lazy(() => import('@/games/dragon-slingshot/DragonSlingshot')),
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
  tictacroll: lazy(() => import('@/games/tictacroll/TicTacRoll')),
  countadd: lazy(() => import('@/games/count-and-add/CountAndAdd')),
  moneyblocks: lazy(() => import('@/games/money-blocks/MoneyBlocks.jsx')),
  parachutedrop: lazy(() => import('@/games/parachute-drop/ParachuteDrop.jsx')),
  superwings: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="superwings" /> }))),
  swampjump: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="swampjump" /> }))),
  treasurechest: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="treasurechest" /> }))),
  unicornwings: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="unicornwings" /> }))),
  feedmonster: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="feedmonster" /> }))),
  higherorlower: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="higherorlower" /> }))),
  picturerace: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="picturerace" /> }))),
  redorblack: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="redorblack" /> }))),
  sentencebuilder: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="sentencebuilder" /> }))),
  'sentence-builder': lazy(() => import('@/games/sentence-builder/SentenceBuilder.jsx')),
  animalAdventureRace: lazy(() => import('@/games/animal-adventure-race/AnimalAdventureRace.jsx')),
  findthebee: lazy(() => import('@/games/find-the-bee/FindTheBee.jsx')),
  riddlebombs: lazy(() => import('@/games/riddle-bombs/RiddleBombs.jsx')),
  finnthefox: lazy(() => import('@/games/finn-the-fox/FinnTheFox.jsx')),
  whatami: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="whatami" /> }))),
  whatsmissing: lazy(() => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="whatsmissing" /> }))),
};
