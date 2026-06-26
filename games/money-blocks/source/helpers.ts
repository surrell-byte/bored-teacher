/** Formats a raw number into a US dollar string, e.g. 12345 → $12,345. */
export function moneyText(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

/** Returns a letter for a given 0-based index: 0→A, 1→B, ... 25→Z, 26→AA, 27→AB... */
export function letterFromIndex(index: number): string {
  let s = '';
  let t = index;
  do { s = String.fromCharCode(65 + (t % 26)) + s; t = Math.floor(t / 26) - 1; } while (t > -1);
  return s;
}