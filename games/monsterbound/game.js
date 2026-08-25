import { DB, TYPES, WILD_POOL } from './data';

export function getTypeMultiplier(attackType, defenderType) {
  return TYPES[attackType]?.[defenderType] ?? 1;
}

export function createMonster(name, level) {
  const base = DB[name];
  if (!base) throw new Error(`Unknown monster: ${name}`);

  const maxHP = base.hp + level * 3;
  return {
    id: Math.random().toString(36).slice(2),
    name,
    emoji: base.emoji,
    type: base.type,
    rarity: base.rarity,
    level,
    maxHP,
    hp: maxHP,
    attack: base.attack + level,
    defense: base.defense + Math.floor(level / 2),
    speed: base.speed + level,
    xp: 0,
    xpNeeded: 100,
    status: null,
    moves: base.moves.map((m) => ({ name: m[0], type: m[1], power: m[2] })),
  };
}

export function calculateDamage({ attacker, defender, move }) {
  const multiplier = getTypeMultiplier(move.type, defender.type);
  let damage = move.power + attacker.attack - defender.defense / 2;
  damage *= multiplier;

  const critical = Math.random() < 0.08;
  if (critical) damage *= 1.7;

  damage *= 0.85 + Math.random() * 0.3;
  damage = Math.max(1, Math.floor(damage));

  return {
    damage,
    critical,
    multiplier,
  };
}

export function performAttack({ attacker, defender, move }) {
  const hit = Math.random() * 100 <= (move.accuracy ?? 100);
  if (!hit) {
    return {
      hit: false,
      damage: 0,
      critical: false,
      multiplier: 1,
      defender,
    };
  }

  const result = calculateDamage({ attacker, defender, move });
  const updatedDefender = {
    ...defender,
    hp: Math.max(0, defender.hp - result.damage),
  };

  return {
    ...result,
    hit: true,
    defender: updatedDefender,
  };
}

export function createWildEncounter(playerLevel) {
  const name = WILD_POOL[Math.floor(Math.random() * WILD_POOL.length)];
  const level = Math.max(2, playerLevel + Math.floor(Math.random() * 5) - 2);
  return createMonster(name, level);
}

export function getCaptureChance(monster) {
  const ratio = monster.hp / monster.maxHP;
  let chance = 0.15 + (1 - ratio) * 0.7;
  if (monster.rarity === "Rare") chance *= 0.8;
  if (monster.rarity === "Legendary") chance *= 0.45;
  return Math.min(0.95, chance);
}

export function attemptCapture(monster) {
  return Math.random() < getCaptureChance(monster);
}

export function awardXpAndApplyProgression(monster, xpGain) {
  let updated = { ...monster, xp: monster.xp + xpGain };
  const messages = [];

  while (updated.xp >= updated.xpNeeded) {
    updated.xp -= updated.xpNeeded;
    updated.level += 1;
    updated.xpNeeded = Math.floor(updated.xpNeeded * 1.25);
    updated.maxHP += 5;
    updated.hp = updated.maxHP;
    updated.attack += 2;
    updated.defense += 2;
    updated.speed += 2;

    messages.push(`✨ Lv.${updated.level}!`);

    const base = DB[updated.name];
    if (base?.evolution && updated.level >= base.evolution.level) {
      const oldName = updated.name;
      updated.name = base.evolution.name;
      updated.maxHP += 15;
      updated.hp = updated.maxHP;
      updated.attack += 5;
      updated.defense += 5;
      updated.speed += 3;
      messages.push(`✨ ${oldName} evolved into ${updated.name}!`);
    }
  }

  return { monster: updated, messages };
}
