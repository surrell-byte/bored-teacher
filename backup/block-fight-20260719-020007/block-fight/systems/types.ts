export type GameStatus = 'playing' | 'dead' | 'win';

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Platform = readonly [x: number, y: number, w: number, h: number];

export type Player = Rect & {
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  attackTimer: number;
  hp: number;
  invincible: number;
};

export type Enemy = Rect & {
  vx: number;
  vy: number;
  alive: boolean;
  dying: boolean;
  deathTimer: number;
  platIdx: number;
};

export type Coin = {
  x: number;
  y: number;
  collected: boolean;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

export type FloatingText = {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
};

export type GameState = {
  player: Player;
  enemies: Enemy[];
  coins: Coin[];
  score: number;
  shake: number;
  hitStop: number;
  particles: Particle[];
  floatingTexts: FloatingText[];
  coyoteTime: number;
  jumpBuffer: number;
  gameState: GameStatus;
};

export type GameUi = {
  score: number;
  hp: number;
  state: GameStatus;
};

export type ControlsState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
};
