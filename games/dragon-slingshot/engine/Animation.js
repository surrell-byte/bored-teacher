/** Advances a named sprite sequence independently of the canvas renderer. */
export class Animation {
  constructor({ frames, fps = 10, loop = true }) {
    this.frames = frames;
    this.fps = fps;
    this.loop = loop;
  }

  frameAt(time) {
    const index = Math.floor((time / 1000) * this.fps);
    return this.loop ? index % this.frames : Math.min(index, this.frames - 1);
  }
}
