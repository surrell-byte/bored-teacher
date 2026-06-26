export const LETTER_COLOR_MAP: Record<string, string> = {
  A: '#000000', B: '#FFFFFF', C: '#FF0000', D: '#FFFF00', E: '#0000FF',
  F: '#008000', G: '#FFA500', H: '#800080', I: '#964B00', J: '#FFC0CB',
  K: '#00FFFF', L: '#808080', M: '#00FF00', N: '#000080', O: '#008080',
  P: '#FF00FF', Q: '#800000', R: 'rainbow', S: '#808000', T: '#FFD700',
  U: '#C0C0C0', V: '#4B0082', W: '#40E0D0', X: '#FF7F50', Y: '#E6E6FA',
  Z: '#F5F5DC',
};

export function shade(hex: string, p: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + p))));
  return `rgb(${cl(r)},${cl(g)},${cl(b)})`;
}

export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function textColorFor(hex: string): string {
  if (hex === 'rainbow') return '#ffffff';
  return luminance(hex) > 0.58 ? '#14161E' : '#F3EFE6';
}

export function tileGradient(hex: string): string | null {
  if (hex === 'rainbow') return null;
  return `linear-gradient(150deg, ${hex}, ${shade(hex, -0.38)})`;
}

