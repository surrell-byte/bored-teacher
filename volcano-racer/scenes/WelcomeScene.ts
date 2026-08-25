import { Scene } from '../../../engine/core/Scene';
import { CANVAS_W, CANVAS_H } from '../config';
import { drawVolcanoBackground, drawTitle } from '../draw/Theme';

export class WelcomeScene extends Scene {
  enter() {
    this.engine.ui.clearButtons();
    this.engine.ui.addButton({
      id: 'start',
      x: CANVAS_W / 2 - 90,
      y: CANVAS_H - 100,
      width: 180,
      height: 52,
      label: 'Start Engines',
      onClick: () => this.engine.scenes.goto('setup'),
    });
  }

  draw() {
    const ctx = this.engine.renderer.ctx;
    drawVolcanoBackground(ctx, CANVAS_H);
    drawTitle(ctx, 'VOLCANO', CANVAS_W / 2, CANVAS_H / 2 - 60, 40);
    drawTitle(ctx, 'RACER', CANVAS_W / 2, CANVAS_H / 2 - 20, 40);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcf9e';
    ctx.font = '14px sans-serif';
    ctx.fillText('a card-powered dash to the finish line', CANVAS_W / 2, CANVAS_H / 2 + 14);
    ctx.restore();
  }

  exit() {
    this.engine.ui.clearButtons();
  }
}
