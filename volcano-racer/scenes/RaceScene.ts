import { Scene } from '../../../engine/core/Scene';
import { Random } from '../../engine/utils/random';
import {
  CANVAS_W,
  CANVAS_H,
  TRACK_TILES,
  FINISH_TILE,
  CHECKPOINT_TILE,
  CPU_THINK_DELAY_MS,
  CPU_WEIGHTS,
} from '../config';
import { drawVolcanoBackground, drawTitle } from '../draw/Theme';
import { tileCenter, fullPath } from '../track/TrackLayout';
import { RacerToken } from '../entities/RacerToken';
import { RaceGameState, PlayerState } from '../state/RaceState';
import { CardDefinition, getHand, rollCardDelta } from '../data/cards';

interface CardSlot {
  def: CardDefinition;
  x: number;
  y: number;
  w: number;
  h: number;
}

const SLOTS = [
  { x: 15, y: 352, w: 180, h: 44 },
  { x: 205, y: 352, w: 180, h: 44 },
  { x: 15, y: 402, w: 180, h: 44 },
  { x: 205, y: 402, w: 180, h: 44 },
];

type Phase = 'choosing' | 'animating' | 'cpu-wait';

export class RaceScene extends Scene {
  private tokens: RacerToken[] = [];
  private cardSlots: CardSlot[] = [];
  private phase: Phase = 'choosing';
  private message = '';
  private messageTimer = 0;

  private movingToken: RacerToken | null = null;
  private movingPlayer: PlayerState | null = null;
  private pendingFinish = false;
  private pendingCheckpoint = false;

  private cpuTimeoutId: number | null = null;
  private iceTimeoutId: number | null = null;

  constructor(private state: RaceGameState) {
    super();
  }

  enter() {
    this.state.resetForRace();
    this.tokens = [
      new RacerToken(this.state.players[0].name, this.state.players[0].carColor || '#e54b3c', -8),
      new RacerToken(this.state.players[1].name, this.state.players[1].carColor || '#2e86de', 8),
    ];
    this.tokens.forEach((t) => t.snapToTile(0));

    this.message = '';
    this.messageTimer = 0;
    this.beginTurn();
  }

  private beginTurn() {
    let guard = 0;
    while (this.state.current.skipNext && guard < 4) {
      const skipped = this.state.current;
      skipped.skipNext = false;
      this.setMessage(`${skipped.name} is frozen — skipped this round!`, 1.5);
      this.state.advanceTurn();
      guard++;
    }

    this.phase = 'choosing';
    this.pendingFinish = false;
    this.pendingCheckpoint = false;
    this.movingToken = null;
    this.movingPlayer = null;

    if (this.state.current.isCPU) {
      this.cardSlots = [];
      this.scheduleCpuTurn();
    } else {
      this.refreshHand();
    }
  }

  private refreshHand() {
    const hand = getHand(this.state.current.boostUnlocked);
    this.cardSlots = hand.map((def, i) => ({ def, ...SLOTS[i] }));
  }

  private scheduleCpuTurn() {
    this.phase = 'cpu-wait';
    this.cpuTimeoutId = window.setTimeout(() => {
      if (this.phase !== 'cpu-wait') return;
      const hand = getHand(this.state.current.boostUnlocked);
      const choice = this.pickCpuCard(hand);
      this.playCard(choice);
    }, CPU_THINK_DELAY_MS);
  }

  private pickCpuCard(hand: CardDefinition[]): CardDefinition {
    const weights = hand.map((c) => CPU_WEIGHTS[c.id] ?? 1);
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Random.float(0, total);
    for (let i = 0; i < hand.length; i++) {
      if (roll < weights[i]) return hand[i];
      roll -= weights[i];
    }
    return hand[hand.length - 1];
  }

  private playCard(def: CardDefinition) {
    if (this.phase !== 'choosing' && this.phase !== 'cpu-wait') return;

    const player = this.state.current;
    const token = this.tokens[this.state.currentIndex];
    this.cardSlots = [];
    this.phase = 'animating';

    if (def.id === 'ice_cold') {
      player.skipNext = true;
      this.setMessage(`${player.name} plays Ice Cold — frozen for next round!`, 1.3);
      this.iceTimeoutId = window.setTimeout(() => {
        this.state.advanceTurn();
        this.beginTurn();
      }, 700);
      return;
    }

    const delta = rollCardDelta(def.id);
    let newTile = Math.max(0, player.tile + delta);

    const crossedCheckpoint = !player.boostUnlocked && newTile >= CHECKPOINT_TILE;
    const reachedFinish = newTile >= FINISH_TILE;
    if (reachedFinish) newTile = FINISH_TILE;

    player.tile = newTile;
    if (crossedCheckpoint) player.boostUnlocked = true;

    const steps = Math.abs(delta);
    const tileWord = steps === 1 ? 'tile' : 'tiles';
    this.setMessage(
      delta >= 0
        ? `${player.name} plays ${def.label} — forward ${steps} ${tileWord}!`
        : `${player.name} plays ${def.label} — back ${steps} ${tileWord}!`,
      1.3
    );

    this.pendingFinish = reachedFinish;
    this.pendingCheckpoint = crossedCheckpoint;
    this.movingToken = token;
    this.movingPlayer = player;
    token.goToTile(newTile);
  }

  private resolveMove() {
    const player = this.movingPlayer;
    const wasFinish = this.pendingFinish;
    const wasCheckpoint = this.pendingCheckpoint;
    this.movingToken = null;
    this.movingPlayer = null;

    if (wasFinish && player) {
      player.finished = true;
      this.state.winnerIndex = this.state.currentIndex;
      this.engine.scenes.goto('victory');
      return;
    }

    if (wasCheckpoint && player) {
      this.setMessage(`${player.name} crossed the checkpoint — Super Boost unlocked!`, 1.6);
    }

    this.state.advanceTurn();
    this.beginTurn();
  }

  private setMessage(text: string, seconds: number) {
    this.message = text;
    this.messageTimer = seconds;
  }

  update(dt: number) {
    for (const t of this.tokens) t.update(dt);

    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }

    if (this.phase === 'animating') {
      if (this.movingToken && !this.movingToken.moving) {
        this.resolveMove();
      }
      return;
    }

    if (this.phase === 'choosing' && !this.state.current.isCPU) {
      const { pointer } = this.engine.input;
      if (pointer.justPressed) {
        for (const slot of this.cardSlots) {
          if (
            pointer.x >= slot.x &&
            pointer.x <= slot.x + slot.w &&
            pointer.y >= slot.y &&
            pointer.y <= slot.y + slot.h
          ) {
            this.playCard(slot.def);
            break;
          }
        }
      }
    }
  }

  draw() {
    const ctx = this.engine.renderer.ctx;
    drawVolcanoBackground(ctx, CANVAS_H);
    drawTitle(ctx, 'VOLCANO RACER', CANVAS_W / 2, 26, 18);

    this.drawTrack(ctx);
    for (const t of this.tokens) t.draw(this.engine.renderer);

    this.drawStandings(ctx);
    this.drawTurnBanner(ctx);

    if (this.phase === 'choosing' && !this.state.current.isCPU) {
      this.drawCards(ctx);
    } else if (this.phase === 'cpu-wait') {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffcf9e';
      ctx.font = 'italic 13px sans-serif';
      ctx.fillText('CPU is choosing a card…', CANVAS_W / 2, 380);
      ctx.restore();
    }
  }

  private drawTrack(ctx: CanvasRenderingContext2D) {
    const path = fullPath();

    ctx.save();
    ctx.strokeStyle = 'rgba(90,60,50,0.9)';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    path.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.restore();

    for (let tile = 1; tile <= TRACK_TILES; tile++) {
      const p = tileCenter(tile);
      const isCheckpoint = tile === CHECKPOINT_TILE;
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
      ctx.fillStyle = isCheckpoint ? '#4a2f14' : '#2c1c16';
      ctx.fill();
      ctx.strokeStyle = isCheckpoint ? '#ffd83c' : '#7a5142';
      ctx.lineWidth = isCheckpoint ? 2.5 : 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffe8b0';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(tile), p.x, p.y + 1);
      ctx.restore();
    }

    const start = tileCenter(0);
    const finish = tileCenter(FINISH_TILE);
    ctx.save();
    ctx.fillStyle = '#ffe8b0';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('START', start.x, start.y + 26);
    ctx.fillText('FINISH', finish.x, finish.y - 22);
    ctx.restore();
  }

  private drawStandings(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    this.state.players.forEach((p, i) => {
      ctx.fillStyle = p.carColor || '#ffe8b0';
      const tileLabel = p.tile >= FINISH_TILE ? 'FINISH' : `${p.tile}/${TRACK_TILES}`;
      ctx.fillText(`${p.name}: ${tileLabel}`, 12, 44 + i * 14);
    });
    ctx.restore();
  }

  private drawTurnBanner(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '13px sans-serif';
    if (this.messageTimer > 0 && this.message) {
      ctx.fillStyle = '#ffd83c';
      ctx.fillText(this.message, CANVAS_W / 2, 320);
    } else {
      ctx.fillStyle = '#ffcf9e';
      const label = this.state.current.isCPU ? "CPU's turn" : `${this.state.current.name}'s turn`;
      ctx.fillText(label, CANVAS_W / 2, 320);
    }
    ctx.restore();
  }

  private drawCards(ctx: CanvasRenderingContext2D) {
    for (const slot of this.cardSlots) {
      ctx.save();
      ctx.fillStyle = 'rgba(20,10,8,0.55)';
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 8);
      ctx.fill();
      ctx.strokeStyle = slot.def.color;
      ctx.lineWidth = 2;
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 8);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = slot.def.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(slot.def.label, slot.x + 12, slot.y + 17);
      ctx.fillStyle = '#ffe8b0';
      ctx.font = '10px sans-serif';
      ctx.fillText(slot.def.description, slot.x + 12, slot.y + 32);
      ctx.restore();
    }
  }

  exit() {
    this.engine.ui.clearButtons();
    if (this.cpuTimeoutId !== null) window.clearTimeout(this.cpuTimeoutId);
    if (this.iceTimeoutId !== null) window.clearTimeout(this.iceTimeoutId);
    this.cpuTimeoutId = null;
    this.iceTimeoutId = null;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
