export const STRINGS = {
  left: [1, 3, 5],
  right: [2, 4, 6]
};

export const NAMES = {
  left: "Leo",
  right: "Mia"
};

// Which way a rig tilts when a given die face is cut (-1 left, 1 right, 0 none)
export const TILT_DIR = {
  1: -1, 3: 1, 5: 0,
  2: -1, 4: 1, 6: 0
};

// Which die faces light up which pips (indices into the 3x3 pip grid)
export const FACE_PATTERNS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

// Minimum number of "tick" frames the die must spin before Stop is allowed,
// so a reflex double-click can't skip the suspense entirely.
export const MIN_ROLL_TICKS = 4;

// Interval (ms) between face changes while the die is rolling.
export const ROLL_TICK_MS = 75;
