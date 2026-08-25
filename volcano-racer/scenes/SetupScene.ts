import { Scene } from '../../../engine/core/Scene';
import { CANVAS_W, CANVAS_H } from '../config';
import { drawVolcanoBackground, drawTitle } from '../draw/Theme';
import { RaceGameState } from '../state/RaceState';

const MODE_BTN = { y: 150, w: 165, h: 46, gap: 10 };
const SOLO_X = CANVAS_W / 2 - MODE_BTN.w - MODE_BTN.gap / 2;
const TWO_X = CANVAS_W / 2 + MODE_BTN.gap / 2;

/**
 * The one screen with real text entry. Everything else in this game is
 * click/tap only, so this scene briefly drops a couple of DOM <input>
 * elements on top of the canvas, then removes them on exit().
 */
export class SetupScene extends Scene {
  private twoPlayer = false;
  private inputWrap: HTMLDivElement | null = null;
  private p1Input: HTMLInputElement | null = null;
  private p2Input: HTMLInputElement | null = null;

  constructor(private state: RaceGameState) {
    super();
  }

  enter() {
    this.twoPlayer = this.state.twoPlayer;
    this.buildDom();
    this.buildButtons();
  }

  private buildDom() {
    const canvasEl = this.engine.renderer.canvas.el;
    const parent = canvasEl.parentElement;
    if (!parent) return;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    const wrap = document.createElement('div');
    wrap.style.position = 'absolute';
    wrap.style.left = '0';
    wrap.style.top = '0';
    wrap.style.width = `${CANVAS_W}px`;
    wrap.style.pointerEvents = 'none';

    const inputStyle = (input: HTMLInputElement, top: number) => {
      input.style.position = 'absolute';
      input.style.left = `${CANVAS_W / 2 - 110}px`;
      input.style.top = `${top}px`;
      input.style.width = '220px';
      input.style.padding = '8px 10px';
      input.style.borderRadius = '8px';
      input.style.border = '1px solid #ff9a5c';
      input.style.background = 'rgba(20,10,8,0.85)';
      input.style.color = '#ffe8b0';
      input.style.font = '14px sans-serif';
      input.style.pointerEvents = 'auto';
      input.style.outline = 'none';
      input.maxLength = 16;
    };

    this.p1Input = document.createElement('input');
    this.p1Input.placeholder = 'Player 1 name';
    this.p1Input.value = this.state.players[0]?.name === 'Player 1' ? '' : this.state.players[0]?.name ?? '';
    inputStyle(this.p1Input, 232);

    this.p2Input = document.createElement('input');
    this.p2Input.placeholder = 'Player 2 name';
    this.p2Input.value =
      this.state.twoPlayer && this.state.players[1]?.name !== 'Player 2' ? this.state.players[1]?.name ?? '' : '';
    inputStyle(this.p2Input, 282);
    this.p2Input.style.display = this.twoPlayer ? 'block' : 'none';

    wrap.appendChild(this.p1Input);
    wrap.appendChild(this.p2Input);
    parent.appendChild(wrap);
    this.inputWrap = wrap;
  }

  private buildButtons() {
    this.engine.ui.clearButtons();

    this.engine.ui.addButton({
      id: 'mode-solo',
      x: SOLO_X,
      y: MODE_BTN.y,
      width: MODE_BTN.w,
      height: MODE_BTN.h,
      label: '1 Player (vs CPU)',
      onClick: () => {
        this.twoPlayer = false;
        if (this.p2Input) this.p2Input.style.display = 'none';
      },
    });

    this.engine.ui.addButton({
      id: 'mode-two',
      x: TWO_X,
      y: MODE_BTN.y,
      width: MODE_BTN.w,
      height: MODE_BTN.h,
      label: '2 Players',
      onClick: () => {
        this.twoPlayer = true;
        if (this.p2Input) this.p2Input.style.display = 'block';
      },
    });

    this.engine.ui.addButton({
      id: 'continue',
      x: CANVAS_W / 2 - 90,
      y: CANVAS_H - 90,
      width: 180,
      height: 52,
      label: 'Choose Your Car',
      onClick: () => {
        const p1 = this.p1Input?.value ?? '';
        const p2 = this.p2Input?.value ?? '';
        this.state.configurePlayers(p1, p2, this.twoPlayer);
        this.engine.scenes.goto('car-select');
      },
    });
  }

  draw() {
    const ctx = this.engine.renderer.ctx;
    drawVolcanoBackground(ctx, CANVAS_H);
    drawTitle(ctx, 'GET READY', CANVAS_W / 2, 60, 26);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcf9e';
    ctx.font = '13px sans-serif';
    ctx.fillText('Racing solo against the CPU, or pass-and-play?', CANVAS_W / 2, 110);

    // highlight the selected mode button underneath it
    ctx.strokeStyle = '#ffd83c';
    ctx.lineWidth = 3;
    const hx = this.twoPlayer ? TWO_X : SOLO_X;
    ctx.strokeRect(hx - 2, MODE_BTN.y - 2, MODE_BTN.w + 4, MODE_BTN.h + 4);

    ctx.fillStyle = '#ffcf9e';
    ctx.font = '13px sans-serif';
    ctx.fillText('Enter your racer name(s):', CANVAS_W / 2, 218);
    ctx.restore();
  }

  exit() {
    this.engine.ui.clearButtons();
    this.inputWrap?.remove();
    this.inputWrap = null;
    this.p1Input = null;
    this.p2Input = null;
  }
}
