const BACKGROUND = "#202124";
const FOREGROUND = "#d6d6d6";
const SESAME = "#fff3d6";

export function drawBurger(
  context: CanvasRenderingContext2D,
  x: number,
  top: number,
  duck: boolean,
  frame: number,
  airborne: boolean,
  bun: string,
) {
  const pixel = (color: string, left: number, upper: number, width: number, height: number) => {
    context.fillStyle = color;
    context.fillRect(Math.round(x + left), Math.round(top + upper), width, height);
  };
  const eyes = bun.toLowerCase() === "#111111" ? SESAME : BACKGROUND;

  if (duck) {
    pixel(FOREGROUND, 8 + (frame ? 0 : 6), -6, 6, 6);
    pixel(FOREGROUND, 34 + (frame ? 6 : 0), -6, 6, 6);
    pixel(bun, 0, -12, 50, 6);
    pixel("#6b3a1e", -2, -18, 54, 6);
    pixel("#f5c518", 0, -21, 50, 3);
    pixel("#5aa83a", -2, -24, 54, 3);
    pixel(bun, 2, -32, 46, 8);
    pixel(bun, 8, -36, 34, 4);
    pixel(eyes, 32, -30, 4, 4);
    pixel(eyes, 40, -30, 4, 4);
    return;
  }

  const step = airborne ? 0 : frame;
  pixel(FOREGROUND, 10, -8, 6, 8 - (step ? 4 : 0));
  pixel(FOREGROUND, 26, -8, 6, 8 - (step ? 0 : 4));
  pixel(bun, 2, -16, 38, 8);
  pixel("#6b3a1e", 0, -24, 42, 8);
  pixel("#f5c518", 2, -28, 38, 4);
  pixel("#5aa83a", -2, -32, 46, 4);
  pixel(bun, 2, -40, 38, 8);
  pixel(bun, 8, -44, 26, 4);
  pixel(SESAME, 12, -43, 3, 2);
  pixel(SESAME, 24, -42, 3, 2);
  pixel(SESAME, 18, -39, 3, 2);
  pixel(eyes, 26, -38, 4, 5);
  pixel(eyes, 33, -38, 4, 5);
}
