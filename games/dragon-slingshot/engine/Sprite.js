/** Draws one cell from the Dragon Slingshot sprite atlas. */
export class Sprite {
  constructor(image, { x, y, frameWidth, frameHeight, frames = 1, scale = 1 }) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.scale = scale;
  }

  draw(ctx, x, y, frame = 0, options = {}) {
    if (!this.image.complete || !this.image.naturalWidth) return;
    const scale = options.scale ?? this.scale;
    const width = this.frameWidth * scale;
    const height = this.frameHeight * scale;
    const sourceX = this.x + (frame % this.frames) * this.frameWidth;
    ctx.save();
    ctx.translate(x, y);
    if (options.flipX) ctx.scale(-1, 1);
    ctx.drawImage(this.image, sourceX, this.y, this.frameWidth, this.frameHeight, -width / 2, -height / 2, width, height);
    ctx.restore();
  }
}
