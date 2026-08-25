export const DB = {
  Embercub: {
    emoji: "🐯",
    type: "fire",
    rarity: "Common",
    hp: 45,
    attack: 13,
    defense: 9,
    speed: 12,
    evolution: { level: 16, name: "Flareclaw" },
    moves: [
      ["Flame Bite", "fire", 18],
      ["Scratch", "normal", 13],
      ["Roar", "normal", 8],
      ["Inferno", "fire", 25],
    ],
  },
  Aquafin: {
    emoji: "🐬",
    type: "water",
    rarity: "Common",
    hp: 48,
    attack: 11,
    defense: 10,
    speed: 13,
    evolution: { level: 16, name: "Tiderex" },
    moves: [
      ["Water Blast", "water", 18],
      ["Tackle", "normal", 13],
      ["Splash Rush", "water", 15],
      ["Tidal Wave", "water", 25],
    ],
  },
  Mossprout: {
    emoji: "🌱",
    type: "nature",
    rarity: "Common",
    hp: 52,
    attack: 10,
    defense: 12,
    speed: 8,
    evolution: { level: 16, name: "Thornback" },
    moves: [
      ["Vine Whip", "nature", 18],
      ["Tackle", "normal", 13],
      ["Leaf Storm", "nature", 24],
      ["Guard", "normal", 8],
    ],
  },
  Voltiger: {
    emoji: "⚡",
    type: "electric",
    rarity: "Uncommon",
    hp: 42,
    attack: 15,
    defense: 8,
    speed: 17,
    evolution: { level: 20, name: "Stormclaw" },
    moves: [
      ["Spark", "electric", 18],
      ["Bite", "normal", 14],
      ["Thunder Rush", "electric", 22],
      ["Quick Strike", "normal", 12],
    ],
  },
  Stonejaw: {
    emoji: "🐊",
    type: "earth",
    rarity: "Uncommon",
    hp: 65,
    attack: 15,
    defense: 18,
    speed: 5,
    evolution: { level: 22, name: "Terradon" },
    moves: [
      ["Rock Smash", "earth", 18],
      ["Bite", "normal", 14],
      ["Earthquake", "earth", 27],
      ["Guard", "normal", 8],
    ],
  },
  Nightwing: {
    emoji: "🦇",
    type: "shadow",
    rarity: "Rare",
    hp: 40,
    attack: 14,
    defense: 8,
    speed: 18,
    evolution: { level: 24, name: "Dreadwing" },
    moves: [
      ["Shadow Claw", "shadow", 19],
      ["Bite", "normal", 14],
      ["Dark Pulse", "shadow", 24],
      ["Quick Strike", "normal", 12],
    ],
  },
  Frosthorn: {
    emoji: "🦏",
    type: "ice",
    rarity: "Rare",
    hp: 58,
    attack: 16,
    defense: 14,
    speed: 7,
    evolution: { level: 26, name: "Glacierhorn" },
    moves: [
      ["Ice Charge", "ice", 18],
      ["Horn Rush", "normal", 15],
      ["Frozen Blast", "ice", 25],
      ["Guard", "normal", 8],
    ],
  },
  Pyrodrake: {
    emoji: "🐲",
    type: "fire",
    rarity: "Legendary",
    hp: 80,
    attack: 23,
    defense: 17,
    speed: 18,
    moves: [
      ["Dragon Flame", "fire", 28],
      ["Claw Strike", "normal", 20],
      ["Infernal Roar", "fire", 35],
      ["Skybreaker", "normal", 25],
    ],
  },
};

export const TYPES = {
  fire: { nature: 2, ice: 2, water: 0.5, fire: 0.5 },
  water: { fire: 2, earth: 2, nature: 0.5, water: 0.5 },
  nature: { water: 2, earth: 2, fire: 0.5, ice: 0.5 },
  electric: { water: 2, shadow: 2, earth: 0 },
  earth: { electric: 2, fire: 2, nature: 0.5 },
  ice: { nature: 2, earth: 2, fire: 0.5 },
  shadow: { shadow: 0.5 },
  normal: {},
};

export const CHAMPIONS = [
  { name: "Mara", title: "Flame Champion", monster: "Embercub", level: 14, reward: 300 },
  { name: "Kai", title: "Tide Champion", monster: "Aquafin", level: 18, reward: 400 },
  { name: "Rhea", title: "Forest Champion", monster: "Mossprout", level: 22, reward: 500 },
  { name: "Volt", title: "Storm Champion", monster: "Voltiger", level: 26, reward: 600 },
  { name: "Bram", title: "Earth Champion", monster: "Stonejaw", level: 30, reward: 700 },
  { name: "Nox", title: "Shadow Champion", monster: "Nightwing", level: 34, reward: 800 },
  { name: "Frey", title: "Frost Champion", monster: "Frosthorn", level: 38, reward: 900 },
  { name: "Astra", title: "Grand Champion", monster: "Pyrodrake", level: 45, reward: 2000 },
];

export const MOVE_COLOR = {
  fire: "#d84a3d",
  water: "#327fd1",
  nature: "#3d9d54",
  electric: "#d1a82e",
  earth: "#8c6c4b",
  ice: "#55aabe",
  shadow: "#674c9b",
  normal: "#64748b",
};

export const MW = 16;
export const MH = 10;
export const WILD_POOL = ["Embercub", "Aquafin", "Mossprout", "Voltiger", "Stonejaw", "Nightwing", "Frosthorn"];

export function tileAt(x, y) {
  if (x < 2 && y < 3) return "water";
  if (x > 13 && y > 7) return "water";
  if (x >= 5 && x <= 10 && y >= 3 && y <= 6) return "town";
  if (y === 5 || x === 7) return "path";
  if ((x < 3 && y > 6) || (x > 12 && y < 3)) return "forest";
  return "grass";
}

export const TILE_BG = {
  grass: "linear-gradient(135deg,#5fae48,#6bc054)",
  path: "linear-gradient(135deg,#d4ac66,#e0bc7c)",
  water: "linear-gradient(160deg,#2f7fc4,#4bb3e8)",
  town: "linear-gradient(135deg,#a998cc,#c0b2df)",
  forest: "linear-gradient(135deg,#316030,#3d7a3b)",
};
