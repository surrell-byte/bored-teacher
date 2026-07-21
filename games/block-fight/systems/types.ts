export type GameStatus = 'playing' | 'dead' | 'win';

export type WorldId = 'village' | 'forest' | 'mines';

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
  jumpsUsed: number;
  dashTimer: number;
  dashCooldown: number;
};

export type Enemy = Rect & {
  vx: number;
  vy: number;
  alive: boolean;
  dying: boolean;
  deathTimer: number;
  platIdx: number;
  /** Base patrol speed (magnitude) — preserved separately from vx so chase can override direction/speed freely. */
  baseSpeed: number;
  /** True once the enemy has noticed the player and is actively chasing. */
  aggro: boolean;
};

export type Coin = {
  x: number;
  y: number;
  collected: boolean;
};

/** A travel point between worlds — walk into it to switch, if unlocked. */
export type Gate = Rect & {
  targetWorld: WorldId;
  label: string;
  locked: boolean;
};

/** A breakable wall hiding a reward — chip it down with attacks. */
export type SecretWall = Rect & {
  hp: number;
  maxHp: number;
  broken: boolean;
  hitCooldown: number;
};

/** A stationary hub character with a message that reflects current progress. */
export type Npc = Rect & {
  message: string;
};

export type SavePoint = Rect;

/** A short banner message (world cleared, secret found, game saved, gate locked...). */
export type Toast = {
  text: string;
  life: number;
  maxLife: number;
  color: string;
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
  /** Crit labels render bigger, bolder, and with a glow. */
  crit?: boolean;
};

export type GameState = {
  player: Player;
  worldId: WorldId;
  unlocked: Record<WorldId, boolean>;
  enemies: Enemy[];
  coins: Coin[];
  gates: Gate[];
  secretWalls: SecretWall[];
  npc: Npc | null;
  savePoint: SavePoint | null;
  /** True while the player is standing on the save point, so we save once per visit, not every frame. */
  justSaved: boolean;
  toast: Toast | null;
  /** Frames left before a cleared combat world hands control back to the village (or triggers the win screen). */
  worldClearTimer: number;
  score: number;
  shake: number;
  hitStop: number;
  /** Frames remaining of post-hitstop slow motion (crit only) — simulation runs at half rate while this is active. */
  slowMo: number;
  /** Screen-flash overlay strength, 0..1, decays each frame — crit only. */
  flashAlpha: number;
  particles: Particle[];
  floatingTexts: FloatingText[];
  coyoteTime: number;
  jumpBuffer: number;
  dashBuffer: number;
  comboCount: number;
  comboTimer: number;
  gameState: GameStatus;
};

export type GameUi = {
  score: number;
  hp: number;
  state: GameStatus;
  worldName: string;
};

export type ControlsState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  dash: boolean;
};
