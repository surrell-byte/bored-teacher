// Every tunable number for Volcano Racer lives here. Change the board size,
// checkpoint position, or card odds without touching any scene/logic code.

export const CANVAS_W = 400;
export const CANVAS_H = 460;

// --- Track layout ---
export const TRACK_TILES = 16;       // numbered tiles, 1..TRACK_TILES
export const FINISH_TILE = TRACK_TILES + 1;
export const CHECKPOINT_TILE = 9;    // crossing this tile unlocks the Super Boost card
export const TILES_PER_ROW = 4;      // snake layout: 4 rows of 4

export const TRACK_TOP = 60;
export const TRACK_BOTTOM = 300;
export const TRACK_MARGIN_X = 50;

// --- Cars (mirrors the 4-car concept sheet: red / blue / green / yellow) ---
export interface CarDef {
  id: string;
  name: string;
  color: string;
}

export const CARS: CarDef[] = [
  { id: 'red', name: 'Red Racer', color: '#e54b3c' },
  { id: 'blue', name: 'Blue Bolt', color: '#2e86de' },
  { id: 'green', name: 'Green Growler', color: '#3fae52' },
  { id: 'yellow', name: 'Yellow Yeti', color: '#f0c419' },
];

// --- Card move ranges (inclusive) ---
export const QUICK_DASH_RANGE: [number, number] = [2, 4];
export const BURNOUT_RANGE: [number, number] = [1, 3];
export const SUPER_BOOST_RANGE: [number, number] = [4, 6];

// --- CPU behavior ---
export const CPU_THINK_DELAY_MS = 850;
// Weighted odds for each card the CPU can see. Missing entries default to 0.
export const CPU_WEIGHTS: Record<string, number> = {
  quick_dash: 55,
  burnout: 15,
  ice_cold: 5,
  super_boost: 25,
};
