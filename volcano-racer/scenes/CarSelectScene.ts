import { Scene } from '../../../engine/core/Scene';
import { Collision } from '../../../engine/physics/Collision';
import { CANVAS_W, CANVAS_H, CARS, CarDef } from '../config';
import { drawVolcanoBackground, drawTitle } from '../draw/Theme';
import { drawCarIcon } from '../draw/CarIcon';
import { RaceGameState } from '../state/RaceState';

const SWATCH = { w: 140, h: 150, gap: 20, top: 150 };

interface Swatch {
  car: CarDef;
  x: number;
  y: number;
}

export class CarSelectScene extends Scene {
  private swatches: Swatch[] = [];
  private pickerIndex = 0; // which player (0 or 1) is currently choosing
  private taken = new Set<string>();

  constructor(private state: RaceGameState) {
    super();
  }

  enter() {
    this.pickerIndex = 0;
    this.taken = new Set();
    this.layoutSwatches();
    this.engine.ui.clearButtons();
  }

  private layoutSwatches() {
    const cols = 2;
    const totalW = cols * SWATCH.w + (cols - 1) * SWATCH.gap;
    const startX = CANVAS_W / 2 - totalW / 2 + SWATCH.w / 2;

    this.swatches = CARS.map((car, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        car,
        x: startX + col * (SWATCH.w + SWATCH.gap),
        y: SWATCH.top + row * (SWATCH.h + SWATCH.gap) + SWATCH.h / 2,
      };
    });
  }

  private get activePlayer() {
    return this.state.players[this.pickerIndex];
  }

  update() {
    const { pointer } = this.engine.input;
    if (!pointer.justPressed) return;

    for (const s of this.swatches) {
      if (this.taken.has(s.car.id)) continue;
      const hit = Collision.pointInBox(pointer.x, pointer.y, {
        x: s.x,
        y: s.y,
        width: SWATCH.w,
        height: SWATCH.h,
      });
      if (!hit) continue;

      this.activePlayer.carId = s.car.id;
      this.activePlayer.carColor = s.car.color;
      this.taken.add(s.car.id);

      if (this.state.twoPlayer && this.pickerIndex === 0) {
        this.pickerIndex = 1;
      } else {
        this.engine.scenes.goto('race');
      }
      return;
    }
  }

  draw() {
    const ctx = this.engine.renderer.ctx;
    drawVolcanoBackground(ctx, CANVAS_H);
    drawTitle(ctx, 'PICK YOUR RIDE', CANVAS_W / 2, 55, 24);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcf9e';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${this.activePlayer.name}, choose a car`, CANVAS_W / 2, 95);
    ctx.restore();

    for (const s of this.swatches) {
      const isTaken = this.taken.has(s.car.id);
      ctx.save();
      ctx.globalAlpha = isTaken ? 0.3 : 1;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      roundRect(ctx, s.x - SWATCH.w / 2, s.y - SWATCH.h / 2, SWATCH.w, SWATCH.h, 12);
      ctx.fill();
      ctx.strokeStyle = isTaken ? '#5c4b3f' : s.car.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      drawCarIcon(ctx, s.x, s.y - 15, s.car.color, { scale: 1.4 });

      ctx.fillStyle = '#ffe8b0';
      ctx.textAlign = 'center';
      ctx.font = '13px sans-serif';
      ctx.fillText(isTaken ? `${s.car.name} (taken)` : s.car.name, s.x, s.y + SWATCH.h / 2 - 14);
      ctx.restore();
    }
  }

  exit() {
    this.engine.ui.clearButtons();
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
