import { Scene } from '../../../engine/core/Scene';
import { CANVAS_W, CANVAS_H } from '../config';
import { drawVolcanoBackground, drawTitle } from '../draw/Theme';
import { drawCarIcon } from '../draw/CarIcon';
import { RaceGameState } from '../state/RaceState';

export class VictoryScene extends Scene {
  constructor(private state: RaceGameState) {
    super();
  }

  enter() {
    this.engine.ui.clearButtons();
    this.engine.ui.addButton({
      id: 'again',
      x: CANVAS_W / 2 - 90,
      y: CANVAS_H - 150,
      width: 180,
      height: 46,
      label: 'Race Again',
      onClick: () => this.engine.scenes.goto('race'),
    });
    this.engine.ui.addButton({
      id: 'menu',
      x: CANVAS_W / 2 - 90,
      y: CANVAS_H - 90,
      width: 180,
      height: 46,
      label: 'New Racers',
      onClick: () => this.engine.scenes.goto('welcome'),
    });
  }

  private get winner() {
    const idx = this.state.winnerIndex;
    return idx === null ? null : this.state.players[idx];
  }

  draw() {
    const ctx = this.engine.renderer.ctx;
    drawVolcanoBackground(ctx, CANVAS_H);

    const winner = this.winner;
    drawTitle(ctx, 'FINISH LINE!', CANVAS_W / 2, 90, 26);

    if (winner) {
      drawCarIcon(ctx, CANVAS_W / 2, 170, winner.carColor || '#ffd83c', { scale: 1.8, glow: true });

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe8b0';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`${winner.name} wins!`, CANVAS_W / 2, 245);
      ctx.restore();
    }
  }

  exit() {
    this.engine.ui.clearButtons();
  }
}
