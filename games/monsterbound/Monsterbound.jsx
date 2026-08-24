import React, { useState, useEffect, useCallback, useRef } from "react";

/* =========================================================
   MONSTER DATABASE
========================================================= */

const DB = {
  Embercub: {
    emoji: "🐯", type: "fire", rarity: "Common",
    hp: 45, attack: 13, defense: 9, speed: 12,
    evolution: { level: 16, name: "Flareclaw" },
    moves: [
      ["Flame Bite", "fire", 18],
      ["Scratch", "normal", 13],
      ["Roar", "normal", 8],
      ["Inferno", "fire", 25],
    ],
  },
  Aquafin: {
    emoji: "🐬", type: "water", rarity: "Common",
    hp: 48, attack: 11, defense: 10, speed: 13,
    evolution: { level: 16, name: "Tiderex" },
    moves: [
      ["Water Blast", "water", 18],
      ["Tackle", "normal", 13],
      ["Splash Rush", "water", 15],
      ["Tidal Wave", "water", 25],
    ],
  },
  Mossprout: {
    emoji: "🌱", type: "nature", rarity: "Common",
    hp: 52, attack: 10, defense: 12, speed: 8,
    evolution: { level: 16, name: "Thornback" },
    moves: [
      ["Vine Whip", "nature", 18],
      ["Tackle", "normal", 13],
      ["Leaf Storm", "nature", 24],
      ["Guard", "normal", 8],
    ],
  },
  Voltiger: {
    emoji: "⚡", type: "electric", rarity: "Uncommon",
    hp: 42, attack: 15, defense: 8, speed: 17,
    evolution: { level: 20, name: "Stormclaw" },
    moves: [
      ["Spark", "electric", 18],
      ["Bite", "normal", 14],
      ["Thunder Rush", "electric", 22],
      ["Quick Strike", "normal", 12],
    ],
  },
  Stonejaw: {
    emoji: "🐊", type: "earth", rarity: "Uncommon",
    hp: 65, attack: 15, defense: 18, speed: 5,
    evolution: { level: 22, name: "Terradon" },
    moves: [
      ["Rock Smash", "earth", 18],
      ["Bite", "normal", 14],
      ["Earthquake", "earth", 27],
      ["Guard", "normal", 8],
    ],
  },
  Nightwing: {
    emoji: "🦇", type: "shadow", rarity: "Rare",
    hp: 40, attack: 14, defense: 8, speed: 18,
    evolution: { level: 24, name: "Dreadwing" },
    moves: [
      ["Shadow Claw", "shadow", 19],
      ["Bite", "normal", 14],
      ["Dark Pulse", "shadow", 24],
      ["Quick Strike", "normal", 12],
    ],
  },
  Frosthorn: {
    emoji: "🦏", type: "ice", rarity: "Rare",
    hp: 58, attack: 16, defense: 14, speed: 7,
    evolution: { level: 26, name: "Glacierhorn" },
    moves: [
      ["Ice Charge", "ice", 18],
      ["Horn Rush", "normal", 15],
      ["Frozen Blast", "ice", 25],
      ["Guard", "normal", 8],
    ],
  },
  Pyrodrake: {
    emoji: "🐲", type: "fire", rarity: "Legendary",
    hp: 80, attack: 23, defense: 17, speed: 18,
    moves: [
      ["Dragon Flame", "fire", 28],
      ["Claw Strike", "normal", 20],
      ["Infernal Roar", "fire", 35],
      ["Skybreaker", "normal", 25],
    ],
  },
};

const TYPES = {
  fire: { nature: 2, ice: 2, water: 0.5, fire: 0.5 },
  water: { fire: 2, earth: 2, nature: 0.5, water: 0.5 },
  nature: { water: 2, earth: 2, fire: 0.5, ice: 0.5 },
  electric: { water: 2, shadow: 2, earth: 0 },
  earth: { electric: 2, fire: 2, nature: 0.5 },
  ice: { nature: 2, earth: 2, fire: 0.5 },
  shadow: { shadow: 0.5 },
  normal: {},
};

const CHAMPIONS = [
  { name: "Mara", title: "Flame Champion", monster: "Embercub", level: 14, reward: 300 },
  { name: "Kai", title: "Tide Champion", monster: "Aquafin", level: 18, reward: 400 },
  { name: "Rhea", title: "Forest Champion", monster: "Mossprout", level: 22, reward: 500 },
  { name: "Volt", title: "Storm Champion", monster: "Voltiger", level: 26, reward: 600 },
  { name: "Bram", title: "Earth Champion", monster: "Stonejaw", level: 30, reward: 700 },
  { name: "Nox", title: "Shadow Champion", monster: "Nightwing", level: 34, reward: 800 },
  { name: "Frey", title: "Frost Champion", monster: "Frosthorn", level: 38, reward: 900 },
  { name: "Astra", title: "Grand Champion", monster: "Pyrodrake", level: 45, reward: 2000 },
];

const MOVE_COLOR = {
  fire: "#d84a3d", water: "#327fd1", nature: "#3d9d54", electric: "#d1a82e",
  earth: "#8c6c4b", ice: "#55aabe", shadow: "#674c9b", normal: "#64748b",
};

function createMonster(name, level) {
  const b = DB[name];
  const maxHP = b.hp + level * 3;
  return {
    id: Math.random().toString(36).slice(2),
    name, emoji: b.emoji, type: b.type, rarity: b.rarity, level,
    maxHP, hp: maxHP,
    attack: b.attack + level,
    defense: b.defense + Math.floor(level / 2),
    speed: b.speed + level,
    xp: 0, xpNeeded: 100,
    status: null,
    moves: b.moves.map((m) => ({ name: m[0], type: m[1], power: m[2] })),
  };
}

const MW = 16;
const MH = 10;
const WILD_POOL = ["Embercub", "Aquafin", "Mossprout", "Voltiger", "Stonejaw", "Nightwing", "Frosthorn"];

function tileAt(x, y) {
  if (x < 2 && y < 3) return "water";
  if (x > 13 && y > 7) return "water";
  if (x >= 5 && x <= 10 && y >= 3 && y <= 6) return "town";
  if (y === 5 || x === 7) return "path";
  if ((x < 3 && y > 6) || (x > 12 && y < 3)) return "forest";
  return "grass";
}

const TILE_BG = {
  grass: "linear-gradient(135deg,#5fae48,#6bc054)",
  path: "linear-gradient(135deg,#d4ac66,#e0bc7c)",
  water: "linear-gradient(160deg,#2f7fc4,#4bb3e8)",
  town: "linear-gradient(135deg,#a998cc,#c0b2df)",
  forest: "linear-gradient(135deg,#316030,#3d7a3b)",
};

function HPBar({ ratio }) {
  const color = ratio <= 0.25 ? "#ef4444" : ratio <= 0.5 ? "#facc15" : "#22c55e";
  return (
    <div style={{ height: 12, background: "#e2e8f0", borderRadius: 20, overflow: "hidden", marginTop: 8 }}>
      <div style={{ height: "100%", width: `${Math.max(0, ratio) * 100}%`, background: color, transition: "width .3s" }} />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 300, background: "rgba(0,0,0,.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: "min(560px,92%)", maxHeight: "85%", overflow: "auto",
        background: "#17243a", border: "2px solid #506783", borderRadius: 20, padding: 24,
      }}>
        <button onClick={onClose} style={{
          float: "right", width: 34, height: 34, border: 0, borderRadius: 8,
          background: "#e34d4d", color: "white", cursor: "pointer", fontWeight: 700,
        }}>✕</button>
        <h2 style={{ marginBottom: 18, fontSize: 22, letterSpacing: 0.5 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function Monsterbound({ onComplete } = {}) {
  const [screen, setScreen] = useState("title");
  const [pos, setPos] = useState({ x: 8, y: 5 });
  const [money, setMoney] = useState(500);
  const [badges, setBadges] = useState(0);
  const [orbs, setOrbs] = useState(10);
  const [potions, setPotions] = useState(5);
  const [party, setParty] = useState([]);
  const [active, setActive] = useState(0);
  const [discovered, setDiscovered] = useState([]);
  const [quests, setQuests] = useState({ catchCount: 0, defeat: 0 });

  const [battle, setBattle] = useState(null);
  const [battleMsg, setBattleMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [toastText, setToastText] = useState("");
  const [dialogueLines, setDialogueLines] = useState(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const toastTimer = useRef(null);

  const toast = useCallback((text) => {
    setToastText(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(""), 2200);
  }, []);

  const discover = useCallback((name) => {
    setDiscovered((d) => (d.includes(name) ? d : [...d, name]));
  }, []);

  useEffect(() => {
    if (typeof onComplete === "function" && screen === "game" && badges >= 8) {
      onComplete(1000, 100);
    }
  }, [badges, onComplete, screen]);

  function startNewGame() {
    setPos({ x: 8, y: 5 });
    setMoney(500); setBadges(0); setOrbs(10); setPotions(5);
    setParty([]); setDiscovered([]); setQuests({ catchCount: 0, defeat: 0 });
    setScreen("starter");
  }

  function chooseStarter(name) {
    const mon = createMonster(name, 5);
    setParty([mon]);
    discover(name);
    setScreen("game");
    setTimeout(() => {
      setDialogueLines([
        "Welcome to the Wild Frontier!",
        "Eight Champions await you across the region.",
        "Build your team, discover new monsters and earn every badge.",
      ]);
      setDialogueIndex(0);
    }, 400);
  }

  const move = useCallback((dx, dy) => {
    if (battle || dialogueLines || modal) return;
    setPos((p) => {
      const nx = Math.min(MW - 1, Math.max(0, p.x + dx));
      const ny = Math.min(MH - 1, Math.max(0, p.y + dy));
      const t = tileAt(nx, ny);
      if (t === "water") return p;
      if ((t === "grass" || t === "forest") && Math.random() < 0.18) {
        setTimeout(() => startWildBattle(), 60);
      }
      return { x: nx, y: ny };
    });
  }, [battle, dialogueLines, modal]);

  useEffect(() => {
    function onKey(e) {
      if (screen !== "game") return;
      if (e.key === "ArrowUp" || e.key === "w") move(0, -1);
      if (e.key === "ArrowDown" || e.key === "s") move(0, 1);
      if (e.key === "ArrowLeft" || e.key === "a") move(-1, 0);
      if (e.key === "ArrowRight" || e.key === "d") move(1, 0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, screen]);

  function startWildBattle() {
    const name = WILD_POOL[Math.floor(Math.random() * WILD_POOL.length)];
    const lvl = Math.max(2, (party[0]?.level || 5) + Math.floor(Math.random() * 5) - 2);
    const enemy = createMonster(name, lvl);
    discover(name);
    setBattle({ enemy, type: "wild" });
    setBattleMsg(`A wild ${name} appeared!`);
  }

  function challengeChampion() {
    if (party.every((m) => m.hp <= 0)) { toast("Your team needs healing first."); return; }
    if (badges >= 8) { toast("You've beaten every Champion!"); return; }
    const champ = CHAMPIONS[badges];
    const enemy = createMonster(champ.monster, champ.level);
    setBattle({ enemy, type: "champion", champion: champ });
    setBattleMsg(`${champ.name}, the ${champ.title}, challenges you!`);
  }

  function useMove(idx) {
    if (!battle || busy) return;
    const player = party[active];
    const moveData = player.moves[idx];
    const enemy = { ...battle.enemy };

    let mult = TYPES[moveData.type]?.[enemy.type] ?? 1;
    let dmg = moveData.power + player.attack - enemy.defense / 2;
    dmg *= mult;
    const crit = Math.random() < 0.08;
    if (crit) dmg *= 1.8;
    dmg *= 0.85 + Math.random() * 0.3;
    dmg = Math.max(1, Math.floor(dmg));

    enemy.hp = Math.max(0, enemy.hp - dmg);

    let text = `${player.name} used ${moveData.name}! ${dmg} damage.`;
    if (crit) text += " CRITICAL HIT!";
    if (mult > 1) text += " Super effective!";
    if (mult < 1) text += " Not very effective.";

    setBattle((b) => ({ ...b, enemy }));
    setBattleMsg(text);
    setBusy(true);

    if (enemy.hp <= 0) {
      setTimeout(() => winBattle(enemy), 700);
      return;
    }
    setTimeout(() => enemyTurn(enemy), 850);
  }

  function enemyTurn(enemySnapshot) {
    setParty((prev) => {
      const p = [...prev];
      const player = { ...p[active] };
      const enemy = enemySnapshot;
      const emove = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
      let mult = TYPES[emove.type]?.[player.type] ?? 1;
      let dmg = emove.power + enemy.attack - player.defense / 2;
      dmg *= mult;
      if (Math.random() < 0.07) dmg *= 1.7;
      dmg *= 0.85 + Math.random() * 0.3;
      dmg = Math.max(1, Math.floor(dmg));
      player.hp = Math.max(0, player.hp - dmg);

      setBattleMsg(`${enemy.name} used ${emove.name}! ${dmg} damage.`);
      p[active] = player;

      if (player.hp <= 0) {
        setTimeout(() => checkTeam(p), 800);
      } else {
        setBusy(false);
      }
      return p;
    });
  }

  function checkTeam(currentParty) {
    const alive = currentParty.some((m) => m.hp > 0);
    if (!alive) {
      loseBattle();
    } else {
      setBusy(false);
      setModal("party");
      setSelecting(true);
    }
  }

  function levelUpAndEvolve(mon) {
    let m = { ...mon };
    while (m.xp >= m.xpNeeded) {
      m.xp -= m.xpNeeded;
      m.level++;
      m.xpNeeded = Math.floor(m.xpNeeded * 1.25);
      m.maxHP += 5; m.hp = m.maxHP;
      m.attack += 2; m.defense += 2; m.speed += 2;
      setBattleMsg((prev) => prev + ` ✨ Lv.${m.level}!`);
      const base = DB[m.name];
      if (base?.evolution && m.level >= base.evolution.level) {
        const old = m.name;
        m.name = base.evolution.name;
        m.maxHP += 15; m.hp = m.maxHP; m.attack += 5; m.defense += 5; m.speed += 3;
        setBattleMsg(`✨ ${old} evolved into ${m.name}!`);
      }
    }
    return m;
  }

  function winBattle(enemy) {
    const xp = enemy.level * 15 + 25;
    setParty((prev) => {
      const p = [...prev];
      let mon = { ...p[active], xp: p[active].xp + xp };
      mon = levelUpAndEvolve(mon);
      p[active] = mon;
      return p;
    });
    setMoney((m) => m + enemy.level * 5 + (battle?.type === "champion" ? battle.champion.reward : 0));
    setQuests((q) => ({ ...q, defeat: q.defeat + 1 }));

    if (battle?.type === "champion") {
      setBadges((b) => b + 1);
      setBattleMsg(`🏆 Defeated ${battle.champion.name}! Badge earned!`);
      setTimeout(endBattle, 1600);
    } else {
      setBattleMsg(`${enemy.name} was defeated! +${xp} XP`);
      setTimeout(endBattle, 1100);
    }
  }

  function capture() {
    if (!battle || busy) return;
    if (battle.type !== "wild") { setBattleMsg("This monster can't be captured!"); return; }
    if (orbs <= 0) { setBattleMsg("You have no Capture Orbs!"); return; }
    setOrbs((o) => o - 1);
    setBusy(true);

    const enemy = battle.enemy;
    const ratio = enemy.hp / enemy.maxHP;
    let chance = 0.15 + (1 - ratio) * 0.7;
    if (enemy.rarity === "Rare") chance *= 0.8;
    if (enemy.rarity === "Legendary") chance *= 0.45;

    if (Math.random() < chance) {
      setParty((p) => [...p, enemy]);
      setQuests((q) => ({ ...q, catchCount: q.catchCount + 1 }));
      discover(enemy.name);
      setBattleMsg(`🎉 You captured ${enemy.name}!`);
      setTimeout(endBattle, 1000);
    } else {
      setBattleMsg(`${enemy.name} broke free!`);
      setTimeout(() => enemyTurn(enemy), 800);
    }
  }

  function usePotion() {
    if (!battle || busy) return;
    if (potions <= 0) { setBattleMsg("No potions left!"); return; }
    const player = party[active];
    if (player.hp >= player.maxHP) { setBattleMsg("HP is already full."); return; }
    setPotions((p) => p - 1);
    setBusy(true);
    setParty((prev) => {
      const p = [...prev];
      p[active] = { ...p[active], hp: Math.min(p[active].maxHP, p[active].hp + 30) };
      return p;
    });
    setBattleMsg(`${player.name} recovered 30 HP!`);
    setTimeout(() => enemyTurn(battle.enemy), 700);
  }

  function runBattle() {
    if (!battle || busy) return;
    if (battle.type !== "wild") { setBattleMsg("Can't run from this battle!"); return; }
    setBusy(true);
    if (Math.random() < 0.8) {
      setBattleMsg("Got away safely!");
      setTimeout(endBattle, 500);
    } else {
      setBattleMsg("Couldn't escape!");
      setTimeout(() => enemyTurn(battle.enemy), 700);
    }
  }

  function loseBattle() {
    setParty((prev) => prev.map((m) => ({ ...m, hp: Math.floor(m.maxHP * 0.5) })));
    setPos({ x: 8, y: 5 });
    setMoney((m) => Math.floor(m * 0.9));
    endBattle();
    toast("Your team was defeated. You returned to Greenhill.");
  }

  function endBattle() {
    setBattle(null);
    setBattleMsg("");
    setBusy(false);
  }

  function pickPartyMember(i) {
    if (selecting) {
      if (party[i].hp <= 0) { toast("That monster can't battle!"); return; }
      setActive(i);
      setSelecting(false);
      setModal(null);
      if (battle) {
        setBattleMsg(`Go, ${party[i].name}!`);
        setBusy(true);
        setTimeout(() => enemyTurn(battle.enemy), 700);
      }
    }
  }

  function buy(item) {
    if (item === "potion") {
      if (money < 50) return toast("Not enough coins.");
      setMoney((m) => m - 50); setPotions((p) => p + 1); toast("Potion purchased!");
    }
    if (item === "orb") {
      if (money < 75) return toast("Not enough coins.");
      setMoney((m) => m - 75); setOrbs((o) => o + 1); toast("Capture Orb purchased!");
    }
  }

  function healTeam() {
    setParty((p) => p.map((m) => ({ ...m, hp: m.maxHP, status: null })));
    toast("Your entire team has been healed!");
  }

  if (screen === "title") {
    return (
      <div style={shellStyle}>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", textAlign: "center",
          background: "radial-gradient(circle at 50% 35%,#31597a,#14243a 40%,#060a12)",
        }}>
          <div>
            <div style={{ fontSize: 110, animation: "bob 3s ease-in-out infinite" }}>🐉</div>
            <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -3 }}>
              MONSTER<span style={{ color: "#f5c842" }}>BOUND</span>
            </div>
            <div style={{ margin: "10px 0 30px", opacity: 0.6, letterSpacing: 5 }}>WILD FRONTIER</div>
            <button onClick={startNewGame} style={btnPrimary}>NEW ADVENTURE</button>
          </div>
        </div>
        <style>{keyframes}</style>
      </div>
    );
  }

  if (screen === "starter") {
    return (
      <div style={{ ...shellStyle, display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1626" }}>
        <div style={{ textAlign: "center", width: "min(760px,94%)" }}>
          <h1 style={{ fontSize: 34, marginBottom: 8 }}>Choose Your Partner</h1>
          <p style={{ opacity: 0.65, marginBottom: 22 }}>Your journey begins with one of three monsters.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              ["Embercub", "🐯", "FIRE", "Fast, fierce and aggressive."],
              ["Aquafin", "🐬", "WATER", "Balanced and adaptable."],
              ["Mossprout", "🌱", "NATURE", "Tough and defensive."],
            ].map(([name, emoji, type, desc]) => (
              <div key={name} onClick={() => chooseStarter(name)} style={starterCard}>
                <div style={{ fontSize: 60 }}>{emoji}</div>
                <h3 style={{ marginTop: 8 }}>{name}</h3>
                <small style={{ opacity: 0.7 }}>{type}</small>
                <p style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const player = party[active];

  return (
    <div style={shellStyle}>
      <div style={hudStyle}>
        <div style={{ fontWeight: 900 }}>MONSTER<span style={{ color: "#f5c842" }}>BOUND</span></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={hudItem}>🪙 {money}</span>
          <span style={hudItem}>🏆 {badges}/8</span>
          <span style={hudItem}>🎯 {orbs}</span>
          <button style={hudBtn} onClick={() => setModal("party")}>PARTY</button>
          <button style={hudBtn} onClick={() => setModal("index")}>INDEX</button>
          <button style={hudBtn} onClick={() => setModal("quests")}>QUESTS</button>
        </div>
      </div>

      <div style={{ position: "absolute", inset: "56px 0 0", overflow: "hidden" }}>
        <div style={{
          position: "absolute", width: MW * 44, height: MH * 44,
          left: `calc(50% - ${pos.x * 44 + 22}px)`, top: `calc(50% - ${pos.y * 44 + 22}px)`,
          transition: "left .08s linear, top .08s linear",
        }}>
          {Array.from({ length: MH }).map((_, y) =>
            Array.from({ length: MW }).map((__, x) => {
              const t = tileAt(x, y);
              return (
                <div key={`${x}-${y}`} style={{
                  position: "absolute", width: 44, height: 44,
                  left: x * 44, top: y * 44, background: TILE_BG[t],
                }} />
              );
            })
          )}
          <div style={{
            position: "absolute", width: 34, height: 34, left: pos.x * 44 + 5, top: pos.y * 44 + 5,
            background: "linear-gradient(160deg,#f87171,#dc2626)", border: "3px solid white",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, boxShadow: "0 4px 10px rgba(0,0,0,.5)",
          }}>🧑</div>
        </div>

        <div style={locationStyle}>🏡 Greenhill</div>

        <div style={{ position: "absolute", top: 18, right: 20, display: "flex", gap: 8 }}>
          <button style={hudBtn} onClick={healTeam}>❤️ HEAL</button>
          <button style={hudBtn} onClick={() => setModal("shop")}>🛒 SHOP</button>
          <button style={hudBtn} onClick={challengeChampion}>🏆 ARENA</button>
        </div>

        <div style={{
          position: "absolute", left: 20, bottom: 20, display: "grid",
          gridTemplateColumns: "48px 48px 48px", gridTemplateRows: "48px 48px", gap: 5,
        }}>
          <div />
          <button style={ctrlBtn} onClick={() => move(0, -1)}>▲</button>
          <div />
          <button style={ctrlBtn} onClick={() => move(-1, 0)}>◀</button>
          <button style={ctrlBtn} onClick={() => move(0, 1)}>▼</button>
          <button style={ctrlBtn} onClick={() => move(1, 0)}>▶</button>
        </div>

        {dialogueLines && (
          <div
            onClick={() => {
              if (dialogueIndex + 1 >= dialogueLines.length) setDialogueLines(null);
              else setDialogueIndex((i) => i + 1);
            }}
            style={dialogueStyle}
          >
            <div style={{ color: "#f5c842", fontWeight: 700, marginBottom: 6 }}>Professor Arlen</div>
            <div>{dialogueLines[dialogueIndex]}</div>
          </div>
        )}

        {toastText && (
          <div style={toastStyle}>{toastText}</div>
        )}
      </div>

      {battle && (
        <div style={battleShell}>
          <div style={{ ...battleSprite, right: "13%", top: "14%" }}>{battle.enemy.emoji}</div>
          {player && <div style={{ ...battleSprite, left: "11%", bottom: "26%" }}>{player.emoji}</div>}

          <div style={{ ...battleCard, left: "7%", top: "7%" }}>
            <div style={{ fontWeight: 700 }}>{battle.enemy.name} <span style={{ float: "right" }}>Lv.{battle.enemy.level}</span></div>
            <HPBar ratio={battle.enemy.hp / battle.enemy.maxHP} />
          </div>

          {player && (
            <div style={{ ...battleCard, right: "7%", bottom: "33%" }}>
              <div style={{ fontWeight: 700 }}>{player.name} <span style={{ float: "right" }}>Lv.{player.level}</span></div>
              <HPBar ratio={player.hp / player.maxHP} />
            </div>
          )}

          <div style={battleTextStyle}>{battleMsg}</div>

          <div style={battleMenuStyle}>
            {player?.moves.map((m, i) => (
              <button key={i} disabled={busy} onClick={() => useMove(i)} style={{ ...moveBtn, background: MOVE_COLOR[m.type] }}>
                {m.name}
              </button>
            ))}
            <button disabled={busy} onClick={capture} style={{ ...moveBtn, background: "#64748b" }}>🎯 CAPTURE</button>
            <button disabled={busy} onClick={usePotion} style={{ ...moveBtn, background: "#64748b" }}>🧪 POTION</button>
            <button disabled={busy} onClick={() => { setModal("party"); setSelecting(true); }} style={{ ...moveBtn, background: "#64748b" }}>🔄 SWITCH</button>
            <button disabled={busy} onClick={runBattle} style={{ ...moveBtn, background: "#64748b" }}>🏃 RUN</button>
          </div>
        </div>
      )}

      {modal === "party" && (
        <Modal title="YOUR PARTY" onClose={() => { setModal(null); setSelecting(false); }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {party.map((mon, i) => (
              <div key={mon.id} onClick={() => pickPartyMember(i)} style={{
                background: "#223550", border: `2px solid ${i === active ? "#f5c842" : "#3d5270"}`,
                borderRadius: 15, padding: 14, cursor: selecting ? "pointer" : "default",
              }}>
                <div style={{ fontSize: 42 }}>{mon.emoji}</div>
                <h3>{mon.name} <small>Lv.{mon.level}</small></h3>
                <p style={{ fontSize: 12, opacity: 0.7 }}>{mon.type.toUpperCase()} · {mon.rarity}</p>
                <p style={{ fontSize: 12 }}>❤️ {mon.hp}/{mon.maxHP}</p>
                <HPBar ratio={mon.hp / mon.maxHP} />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal === "index" && (
        <Modal title="MONSTER INDEX" onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {Object.entries(DB).map(([name, data]) => {
              const found = discovered.includes(name);
              return (
                <div key={name} style={{
                  background: "#223550", borderRadius: 12, padding: 12, textAlign: "center",
                  opacity: found ? 1 : 0.35, filter: found ? "none" : "grayscale(1)",
                }}>
                  <div style={{ fontSize: 34 }}>{found ? data.emoji : "❓"}</div>
                  <strong style={{ fontSize: 13 }}>{found ? name : "Unknown"}</strong>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{found ? data.type.toUpperCase() : "???"}</div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {modal === "quests" && (
        <Modal title="QUESTS" onClose={() => setModal(null)}>
          {[
            { name: "First Capture", desc: "Capture 3 different monsters.", cur: quests.catchCount, goal: 3 },
            { name: "Monster Hunter", desc: "Defeat 10 wild monsters.", cur: quests.defeat, goal: 10 },
            { name: "Champion's Path", desc: "Earn all 8 badges.", cur: badges, goal: 8 },
          ].map((q) => (
            <div key={q.name} style={{
              background: "#223550", borderRadius: 13, padding: 16, marginBottom: 10,
              borderLeft: q.cur >= q.goal ? "5px solid #43c76a" : "none",
            }}>
              <h3>{q.cur >= q.goal ? "✓ " : ""}{q.name}</h3>
              <p style={{ fontSize: 13, opacity: 0.75 }}>{q.desc}</p>
              <div style={{ marginTop: 8, color: "#9db0c9", fontSize: 13 }}>{Math.min(q.cur, q.goal)}/{q.goal}</div>
            </div>
          ))}
        </Modal>
      )}

      {modal === "shop" && (
        <Modal title="GREENHILL SHOP" onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            <div style={shopItem}>
              <div>🧪 Potion<br /><small>Restore 30 HP</small></div>
              <button onClick={() => buy("potion")} style={shopBtn}>50 🪙</button>
            </div>
            <div style={shopItem}>
              <div>🎯 Capture Orb<br /><small>Capture wild monsters</small></div>
              <button onClick={() => buy("orb")} style={shopBtn}>75 🪙</button>
            </div>
          </div>
        </Modal>
      )}

      <style>{keyframes}</style>
    </div>
  );
}

const keyframes = `@keyframes bob { 50% { transform: translateY(-14px); } }`;

const shellStyle = {
  position: "relative", width: "100%", height: "min(760px,94vh)",
  background: "#0b1220", color: "white", fontFamily: "Arial, sans-serif",
  borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)",
  boxShadow: "0 30px 80px rgba(0,0,0,.5)",
};

const btnPrimary = {
  border: 0, padding: "16px 30px", borderRadius: 13, fontWeight: 900,
  cursor: "pointer", background: "#f5c842", color: "#18243a", boxShadow: "0 6px #987508", fontSize: 15,
};

const starterCard = {
  background: "#17243a", border: "3px solid #405675", borderRadius: 18, padding: 22, cursor: "pointer",
};

const hudStyle = {
  height: 56, background: "rgba(8,14,25,.96)", borderBottom: "2px solid #354a67",
  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
};

const hudItem = { fontWeight: 700, fontSize: 13, padding: "6px 8px" };

const hudBtn = {
  border: "1px solid #435a78", background: "#1e3049", color: "white",
  padding: "7px 10px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700,
};

const ctrlBtn = {
  border: "1px solid #4b607c", background: "rgba(8,14,25,.9)", color: "white",
  borderRadius: 10, fontSize: 18, cursor: "pointer",
};

const locationStyle = {
  position: "absolute", top: 16, left: 16, padding: "8px 14px",
  background: "rgba(8,14,25,.88)", borderRadius: 10, fontWeight: 700, fontSize: 13,
};

const dialogueStyle = {
  position: "absolute", left: "50%", bottom: 16, transform: "translateX(-50%)",
  width: "min(600px,90%)", padding: 16, background: "#101a2b", border: "3px solid #536a87",
  borderRadius: 15, cursor: "pointer", fontSize: 14,
};

const toastStyle = {
  position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)",
  background: "#101827", border: "1px solid #526986", padding: "10px 18px",
  borderRadius: 10, fontWeight: 700, fontSize: 13,
};

const battleShell = {
  position: "absolute", inset: 0, background:
    "linear-gradient(#91d6f0 0%, #d9f2f7 52%, #77a95a 52%, #487b3c 100%)",
};

const battleSprite = {
  position: "absolute", width: 130, height: 130, display: "flex",
  alignItems: "center", justifyContent: "center", fontSize: 84,
  filter: "drop-shadow(0 16px 10px rgba(0,0,0,.35))",
};

const battleCard = {
  position: "absolute", width: 210, background: "#f8fafc", color: "#111827",
  border: "3px solid #26364d", borderRadius: 13, padding: 12, boxShadow: "0 8px 20px rgba(0,0,0,.3)",
  fontSize: 13,
};

const battleTextStyle = {
  position: "absolute", left: "50%", bottom: 168, transform: "translateX(-50%)",
  padding: "10px 20px", background: "rgba(0,0,0,.85)", borderRadius: 10, fontWeight: 700, fontSize: 13,
  maxWidth: "80%", textAlign: "center",
};

const battleMenuStyle = {
  position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 150, padding: 14,
  background: "#101827", borderTop: "4px solid #425774", display: "grid",
  gridTemplateColumns: "1fr 1fr", gap: 8,
};

const moveBtn = {
  border: 0, color: "white", borderRadius: 10, fontWeight: 700, cursor: "pointer",
  fontSize: 13, padding: "10px 6px",
};

const shopItem = {
  background: "#223550", padding: 16, borderRadius: 12, display: "flex",
  justifyContent: "space-between", alignItems: "center", fontSize: 13,
};

const shopBtn = {
  border: 0, background: "#f5c842", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 700,
};
