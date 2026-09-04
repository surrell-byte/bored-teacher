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

type GameModule = { default: React.ComponentType<any> };
type GameLoader = () => Promise<GameModule>;

const gameLoaders: Record<string, GameLoader> = {};
const loadedGames = new Map<string, Promise<GameModule>>();

function lazyGame(gameId: string, loader: GameLoader) {
  const load = () => {
    const existing = loadedGames.get(gameId);
    if (existing) return existing;
    const promise = loader();
    loadedGames.set(gameId, promise);
    return promise;
  };

  gameLoaders[gameId] = load;
  return lazy(load);
}

export function preloadGame(gameId: string) {
  gameLoaders[gameId]?.();
}

export type GameComponentProps = {
  onComplete: (score: number, accuracy: number) => void;
  onHudUpdate?: (hud: any) => void;
  [key: string]: unknown;
};

export const GAME_COMPONENTS: Partial<Record<string, React.LazyExoticComponent<React.ComponentType<any>>>> = {
  alphabethunt: lazyGame('alphabethunt', () => import('@/games/alphabet-hunt/AlphabetHunt')),
  tilebattle: lazyGame('tilebattle', () => import('@/games/tile-battle/TileBattle')),
  quiztrail: lazyGame('quiztrail', () => import('@/games/quiz-trail/QuizTrail')),
  unicorn: lazyGame('unicorn', () => import('@/games/unicorn-run/UnicornRun.jsx')),
  warriors: lazyGame('warriors', () => import('@/games/grammar-hoop-slam/GrammarHoopSlam.jsx')),
  compound: lazyGame('compound', () => import('@/games/compound-word-quest/CompoundWordQuest.jsx')),
  wordmatch: lazyGame('wordmatch', () => import('@/games/word-match/WordMatch.jsx')),
  memory: lazyGame('memory', () => import('@/games/memory-game/MemoryMatch.jsx')),
  missingfruit: lazyGame('missingfruit', () => import('@/games/missing-fruit/MissingFruit.jsx')),
  animalclass: lazyGame('animalclass', () => import('@/games/animal-class-quest/AnimalClassQuest.jsx')),
  colourclash: lazyGame('colourclash', () => import('@/games/colour-clash/ColourClash.jsx')),
  hiddencolours: lazyGame('hiddencolours', () => import('@/games/hidden-colours/HiddenColours.jsx')),
  crimsonduel: lazyGame('crimsonduel', () => import('@/games/crimson-color-duel/CrimsonColorDuel.jsx')),
  archersduel: lazyGame('archersduel', () => import('@/games/archers-duel/ArchersDuel.jsx')),
  deepseaReveal: lazyGame('deepseaReveal', () => import('@/games/deep-sea-reveal/DeepSeaReveal.jsx')),
  dragonslingshot: lazyGame('dragonslingshot', () => import('@/games/dragon-slingshot/DragonSlingshot')),
  emojimatch: lazyGame('emojimatch', () => import('@/games/emoji-match/EmojiMatch.jsx')),
  wordfusion: lazyGame('wordfusion', () => import('@/games/word-fusion/WordFusion.jsx')),
  emojispelling: lazyGame('emojispelling', () => import('@/games/emoji-spelling-game/EmojiSpellingMaster.jsx')),
  familyquest: lazyGame('familyquest', () => import('@/games/family-quest/FamilyQuest.jsx')),
  farmgame: lazyGame('farmgame', () => import('@/games/farm-game/FarmGame.jsx')),
  findmyfood: lazyGame('findmyfood', () => import('@/games/find-my-food/FindMyFood.jsx')),
  flagmaster: lazyGame('flagmaster', () => import('@/games/flagmaster/Flagmaster.jsx')),
  foodwordhunt: lazyGame('foodwordhunt', () => import('@/games/food-word-hunt/FoodWordHunt.jsx')),
  fruitwordhunt: lazyGame('fruitwordhunt', () => import('@/games/fruit-word-hunt/FruitWordHunt.jsx')),
  lakersracer: lazyGame('lakersracer', () => import('@/games/lakers-showtime-racer/LakersShowtimeRacer.jsx')),
  neonbridge: lazyGame('neonbridge', () => import('@/games/neon-bridge-of-destiny/NeonBridgeOfDestiny.jsx')),
  oceanquest: lazyGame('oceanquest', () => import('@/games/ocean-quest/OceanQuest.jsx')),
  pacman: lazyGame('pacman', () => import('@/games/pac-man/PacMan.jsx')),
  phonicsadventure: lazyGame('phonicsadventure', () => import('@/games/phonics-adventure/PhonicAdventure.jsx')),
  phonicsworld: lazyGame('phonicsworld', () => import('@/games/phonics-world/PhonicsWorld.jsx')),
  shuttlecock: lazyGame('shuttlecock', () => import('@/games/shuttlecock-smash/ShuttlecockSmash.jsx')),
  tornado: lazyGame('tornado', () => import('@/games/tornado/Tornado.jsx')),
  wgrandprix: lazyGame('wgrandprix', () => import('@/games/w-grand-prix/WGrandPrix.jsx')),
  turbodash: lazyGame('turbodash', () => import('@/games/turbo-dash/TurboDash.jsx')),
  volcanoracer: lazyGame('volcanoracer', () => import('@/games/volcano-racer/VolcanoRacer.jsx')),
  connect4: lazyGame('connect4', () => import('@/games/connect-4/Connect4.jsx')),
  monkeytree: lazyGame('monkeytree', () => import('@/games/monkey-tree-climb/MonkeyTreeClimb.jsx')),
  blockfight: lazyGame('blockfight', () => import('@/games/block-fight/BlockFight')),
  tictacroll: lazyGame('tictacroll', () => import('@/games/tictacroll/TicTacRoll')),
  countadd: lazyGame('countadd', () => import('@/games/count-and-add/CountAndAdd')),
  moneyblocks: lazyGame('moneyblocks', () => import('@/games/money-blocks/MoneyBlocks.jsx')),
  parachutedrop: lazyGame('parachutedrop', () => import('@/games/parachute-drop/ParachuteDrop.jsx')),
  superwings: lazyGame('superwings', () => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="superwings" /> }))),
  swampjump: lazyGame('swampjump', () => import('@/games/swamp-jump/FroggyHop.jsx')),
  treasurechest: lazyGame('treasurechest', () => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="treasurechest" /> }))),
  unicornwings: lazyGame('unicornwings', () => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="unicornwings" /> }))),
  feedmonster: lazyGame('feedmonster', () => import('@/games/feed-the-monster/FeedTheMonster.jsx')),
  numberclouds: lazyGame('numberclouds', () => import('@/games/number-clouds/NumberClouds.jsx')),
  bubblepop: lazyGame('bubblepop', () => import('@/games/bubble-pop/BubblePop.jsx')),
  buildtower: lazyGame('buildtower', () => import('@/games/build-tower/BuildTower.jsx')),
  mathracing: lazyGame('mathracing', () => import('@/games/math-racing/MathRacing.jsx')),
  weatherwizard: lazyGame('weatherwizard', () => import('@/games/weather-wizard/WeatherWizard.jsx')),
  pizzafractions: lazyGame('pizzafractions', () => import('@/games/pizza-fractions/PizzaFractions.jsx')),
  fishingnumbers: lazyGame('fishingnumbers', () => import('@/games/fishing-numbers/FishingNumbers.jsx')),
  shapebuilder: lazyGame('shapebuilder', () => import('@/games/shape-builder/ShapeBuilder.jsx')),
  higherorlower: lazyGame('higherorlower', () => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="higherorlower" /> }))),
  picturerace: lazyGame('picturerace', () => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="picturerace" /> }))),
  redorblack: lazyGame('redorblack', () => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="redorblack" /> }))),
  sentencebuilder: lazyGame('sentencebuilder', () => import('@/games/sentence-builder/SentenceBuilder.jsx')),
  tankwars: lazyGame('tankwars', () => import('@/games/tank-wars/TankWars.jsx')),
  zoogame: lazyGame('zoogame', () => import('@/games/zoo-game/ZooGame.jsx')),
  whatami: lazyGame('whatami', () => import('@/games/what-am-i/WhatAmI.jsx')),
  'sentence-builder': lazyGame('sentence-builder', () => import('@/games/sentence-builder/SentenceBuilder.jsx')),
  animalAdventureRace: lazyGame('animalAdventureRace', () => import('@/games/animal-adventure-race/AnimalAdventureRace.jsx')),
  findthebee: lazyGame('findthebee', () => import('@/games/find-the-bee/FindTheBee.jsx')),
  riddlebombs: lazyGame('riddlebombs', () => import('@/games/riddle-bombs/RiddleBombs.jsx')),
  tonguetwister: lazyGame('tonguetwister', () => import('@/games/tongue-twister/TongueTwisterGame.jsx')),
  finnthefox: lazyGame('finnthefox', () => import('@/games/finn-the-fox/ReadingRescue.jsx')),
  monsterbound: lazyGame('monsterbound', () => import('@/games/monsterbound/Monsterbound.jsx')),
  pluralquest: lazyGame('pluralquest', () => import('@/games/plural-quest/PluralQuest.jsx')),
  victoryvet: lazyGame('victoryvet', () => import('@/games/victory-vet/VictoryVet.jsx')),
  whatsmissing: lazyGame('whatsmissing', () => import('@/games/legacy/LegacyGamePort').then(({ default: LegacyGamePort }) => ({ default: (props: GameComponentProps) => <LegacyGamePort {...props} gameId="whatsmissing" /> }))),
};
