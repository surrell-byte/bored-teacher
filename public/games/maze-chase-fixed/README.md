# 🌿 Cannabis Man

A browser-based Pac-Man-style maze game built with vanilla JavaScript ES modules, Canvas 2D, and the Web Audio API — no build step, no dependencies.

---

## Project Structure

```
cannabis-man/
│
├── index.html              # Lean HTML shell
├── README.md
│
├── assets/
│   ├── audio/              # Reserved for future audio assets
│   ├── images/             # Reserved for future image assets
│   └── sprites/            # Reserved for future sprite sheets
│
├── css/
│   └── style.css           # All styles (retro CRT aesthetic)
│
├── js/
│   ├── main.js             # Entry point — wires all modules together
│   │
│   ├── game/
│   │   ├── state.js        # Single source of truth for all mutable state
│   │   ├── initLevel.js    # Level setup (map, pellets, enemies, boss)
│   │   ├── loop.js         # requestAnimationFrame game loop
│   │   ├── movement.js     # Player movement & collectible pickup
│   │   ├── collisions.js   # Player ↔ enemy / boss collision resolution
│   │   ├── scoring.js      # Score, lives, level-complete, game-over
│   │   ├── enemies.js      # Enemy AI (random + Manhattan chase)
│   │   └── boss.js         # Boss movement tick
│   │
│   ├── render/
│   │   ├── drawMaze.js     # Wall tiles
│   │   ├── drawPlayer.js   # Pac-man character
│   │   ├── drawEnemies.js  # Ghost enemies
│   │   ├── drawUI.js       # HUD updates & overlay (show/hide)
│   │   └── drawEffects.js  # Pellets, power-ups, bonus items, boss
│   │
│   ├── input/
│   │   ├── keyboard.js     # Arrow key handling
│   │   ├── touch.js        # Swipe gesture handling
│   │   └── dpad.js         # On-screen D-pad (mobile)
│   │
│   └── utils/
│       ├── audio.js        # Web Audio synthesiser + SFX API
│       ├── storage.js      # localStorage helpers (high score, mute)
│       ├── math.js         # Geometry helpers (clamp, manhattan, findNearestOpen…)
│       └── constants.js    # All magic numbers in one place
│
└── data/
    └── maps.js             # Level map layouts
```

---

## How to Run

Because the game uses ES modules (`type="module"`), it must be served over HTTP — opening `index.html` directly via `file://` will be blocked by CORS.

### Quickest option — Python

```bash
cd cannabis-man
python3 -m http.server 8080
# open http://localhost:8080
```

### Node / npx

```bash
npx serve cannabis-man
```

### VS Code

Install the **Live Server** extension, right-click `index.html` → *Open with Live Server*.

---

## Controls

| Action       | Keyboard      | Mobile            |
|--------------|---------------|-------------------|
| Move         | Arrow keys    | Swipe or D-pad    |
| Toggle mute  | 🔇 button      | 🔇 button          |
| Fullscreen   | `F`           | —                 |

---

## Gameplay

- Collect every **pellet** (green dot) to complete the level.
- Grab a **power-up** (gold orb) to enter Power Mode — ghosts turn blue and can be eaten for bonus points.
- Snag the **bonus item** (cyan square, centre of map) before it disappears.
- Survive until **level 5** to face the **Boss** — hit it 5+ times while powered up to defeat it.
- Each level the enemies move faster and more of them use the chasing AI.

### Scoring

| Event         | Points |
|---------------|--------|
| Pellet        | 10     |
| Power-up      | 100    |
| Bonus item    | 250    |
| Eat ghost     | 250    |
| Boss hit      | 500    |
| Boss kill     | 5 000  |

---

## Adding a New Level

Open `data/maps.js` and append a new array of strings to the `MAPS` export. Use `#` for walls and `.` for open/pellet cells. All rows should be the same length (shorter rows are right-padded with `#` automatically).

```js
// Example — level 4
[
  "####################",
  "#..................#",
  // ...
  "####################",
],
```

---

## Extending the Game

| Goal                        | File(s) to edit                          |
|-----------------------------|------------------------------------------|
| Tune speeds / timings       | `js/utils/constants.js`                  |
| Add a new SFX               | `js/utils/audio.js` → `SFX` object       |
| New collectible type        | `js/game/movement.js` + `js/render/drawEffects.js` |
| New enemy behaviour         | `js/game/enemies.js`                     |
| Different boss pattern      | `js/game/boss.js`                        |
| Swap keyboard shortcuts     | `js/input/keyboard.js`                   |
| Restyle the UI              | `css/style.css`                          |
