#!/usr/bin/env bash
set -euo pipefail

echo "Applying: public API barrel, dependency-direction lint rules, and engine docs..."

if [ -z "${1:-}" ]; then
  echo "Usage: $0 /path/to/bored-teacher-react" >&2
  exit 1
fi
REPO="$1"
if [ ! -f "$REPO/package.json" ]; then
  echo "Error: $REPO/package.json not found — is that the right repo root?" >&2
  exit 1
fi

mkdir -p "$REPO/engine"
cat > "$REPO/engine/index.ts" << 'BOREDTEACHER_EOF'
// engine/index.ts
//
// The engine's entire public API. If it's not exported here, it's internal —
// import from a subpath directly and you're depending on an implementation
// detail that can change without warning.
//
// This file only re-exports what's actually real. `engine/` contains ~30
// other subsystem folders (physics, ai, audio, quests, weather, ...) — see
// MODULES.md. They're empty scaffolding with zero references anywhere in
// the app. They're deliberately NOT exported here; add them only once a
// real game needs one, not speculatively.

// Core — game registration, loading, and the plain-object game contract.
export {
  registerGame,
  getGame,
  getGames,
} from './core/GameRegistry';
export { loadGame } from './core/GameLoader';
export { createGame } from './core/createGame';
export { BaseGame } from './core/BaseGame';
export { createReactGame } from './core/adapters/ReactGameAdapter';
export type {
  GameConfig,
  GameState,
  GameInstance,
  GameDefinition,
} from './core/types';
export type { GameManifest } from './core/GameManifest';

// Layout — the responsive tier system. See layout/GameLayout.tsx.
export { default as GameLayout } from './layout/GameLayout';
export { default as GameShell } from './layout/GameShell';
export { default as GameHeader } from './layout/GameHeader';
export { default as GameSidebar } from './layout/GameSidebar';
export { default as GameBottomBar } from './layout/GameBottomBar';
export type { GameLayoutProps, GameLayoutSlots } from './layout/GameLayout';
export type { GameHeaderProps } from './layout/GameHeader';
export type { GameSidebarProps, GameStat } from './layout/GameSidebar';
export type { GameBottomBarProps, GameButton } from './layout/GameBottomBar';
export type { GameShellProps } from './layout/GameShell';
BOREDTEACHER_EOF
echo "  wrote engine/index.ts"

cat > "$REPO/eslint.config.mjs" << 'BOREDTEACHER_EOF'
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Dependency direction: Engine -> SDK -> Games -> App, never the reverse.
// `hooks/`, `config/`, `types/`, `lib/`, `constants/` are a shared foundation
// layer beneath all of that — anything may depend on them, so they're not
// restricted here. See engine/ARCHITECTURE.md for the full rationale.
const upwardFromEngine = [
  "@/games", "@/games/*",
  "@/features", "@/features/*",
  "@/app", "@/app/*",
  "@/components", "@/components/*",
  "@/providers", "@/providers/*",
  "@/store", "@/store/*",
];
const upwardFromGames = [
  "@/features", "@/features/*",
  "@/app", "@/app/*",
  "@/components", "@/components/*",
  "@/providers", "@/providers/*",
  "@/store", "@/store/*",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["engine/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: upwardFromEngine.map((group) => ({
          group: [group],
          message: "engine/ is the innermost layer (Engine -> SDK -> Games -> App) — it must not import from anything above it.",
        })),
      }],
    },
  },
  {
    files: ["games/**/*.{ts,tsx,jsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: upwardFromGames.map((group) => ({
          group: [group],
          message: "games/ sits below app/features (Engine -> SDK -> Games -> App) — it must not import from either.",
        })),
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
BOREDTEACHER_EOF
echo "  wrote eslint.config.mjs"

mkdir -p "$REPO/engine"
cat > "$REPO/engine/README.md" << 'BOREDTEACHER_EOF'
# engine/

The game engine for bored-teacher-react. Start here, then:

- **`ARCHITECTURE.md`** — dependency direction, what's real vs. scaffolding
- **`MODULES.md`** — status of every subsystem folder
- **`CHANGELOG.md`** — what's actually shipped, dated
- **`CONTRIBUTING.md`** — the rule for adding new modules

## The 30-second version

Import from `@/engine` only — that's the whole public API, deliberately
small (see `index.ts`). Two things are real today: a minimal, currently
functionally-unused game registry (`core`), and a responsive layout system
with one live consumer, BlockFight (`layout`). Everything else under this
directory — physics, ai, audio, quests, weather, plugins, ~25 more folders —
is empty stub files. They exist as placeholders, not commitments.

```ts
import { GameLayout, registerGame } from '@/engine';
```
BOREDTEACHER_EOF
echo "  wrote engine/README.md"

mkdir -p "$REPO/engine"
cat > "$REPO/engine/ARCHITECTURE.md" << 'BOREDTEACHER_EOF'
# Engine architecture

## Dependency direction

```
Engine  →  SDK  →  Games  →  App
```

Dependencies only flow one way, left to right in that diagram. Engine never
imports from SDK, Games, or App. SDK never imports from Games or App. Games
never import from App (`app/`, `features/`, `components/`, `providers/`,
`store/`).

`hooks/`, `config/`, `types/`, `lib/`, `constants/` sit outside this chain as
a shared foundation layer — anything may depend on them. That's a deliberate
exception, not an oversight: `engine/layout/ResponsiveLayout.tsx` depends on
`hooks/useResponsive.ts`, and that's fine, because a responsive-tier hook is
infrastructure, not app business logic.

This is enforced today by `eslint.config.mjs` (`no-restricted-imports`,
scoped to `engine/**` and `games/**`) — not just documented. As of this
writing there are zero violations; the rule exists so the first violation
gets caught in review instead of discovered later.

## What's actually real right now

- **`engine/core`** — a plain-object game registry (`registerGame`/`getGame`/
  `getGames`), a loader, and a `createReactGame` adapter. Functionally
  **unused in production**: the one place that calls it, `games/registry.ts`,
  is never imported by the app — real game routing goes through the
  `GAME_COMPONENTS` map in `app/games/[game]/page.tsx` directly. Worth
  knowing before building anything else on top of `core`.
- **`engine/layout`** — the responsive tier system (`GameLayout` → tier
  layouts). **One real consumer**: BlockFight, wired in directly. Proven to
  typecheck and (as of the latest round) render correctly at every tier —
  see the visual-fix history in chat, not this file.

Every other folder under `engine/` — `physics/`, `ai/`, `audio/`, `quests/`,
`weather/`, `plugins/`, ~25 more — is empty stub files with zero references
anywhere in the app. See `MODULES.md` for the full list and status. Don't
build on them without deciding to first; treat their existence as a naming
placeholder, not a promise of behavior.

## Public API

`engine/index.ts` is the only supported import surface — see that file's own
comments for what's exported and why. Everything else under `engine/` is an
implementation detail. If you're importing a subpath directly
(`@/engine/core/GameRegistry`), you're depending on something that can move.
BOREDTEACHER_EOF
echo "  wrote engine/ARCHITECTURE.md"

mkdir -p "$REPO/engine"
cat > "$REPO/engine/MODULES.md" << 'BOREDTEACHER_EOF'
# Module status

Every top-level folder under `engine/`, classified honestly. "Public API"
means it's exported from `engine/index.ts` — if a module isn't listed there,
importing its subpath directly is depending on an implementation detail.

| Module | Status | Public API | Real consumers | Notes |
|---|---|---|---|---|
| `core` | Minimal, functionally unused | Yes | 0 in production | `games/registry.ts` calls it but is itself never imported by the app. Real game routing bypasses it entirely (`app/games/[game]/page.tsx`'s `GAME_COMPONENTS` map). |
| `layout` | Active | Yes | 1 (`games/block-fight/BlockFight.tsx`) | The responsive tier system built this session. Typechecked and visually verified across breakpoints. |
| `shared` | Empty | No | 0 | `constants/breakpoints.ts` duplicates `config/breakpoints.ts` in concept but is 0 bytes — if this ever gets built, delete one of the two, don't maintain both. |
| `accessibility`, `achievements`, `ai`, `animation`, `audio`, `badges`, `camera`, `cutscenes`, `debug`, `devtools`, `dialogue`, `economy`, `editor`, `effects`, `errors`, `inventory`, `localization`, `logging`, `navigation`, `networking`, `performance`, `physics`, `plugins`, `progression`, `quests`, `rendering`, `replay`, `save`, `scoring`, `skills`, `statistics`, `storage`, `testing`, `themes`, `tutorials`, `utils`, `versioning`, `weather` | Unimplemented | No | 0 | Every file in these folders is 0 bytes. Scaffolding with no behavior — do not import, do not build on top of, until there's a real game that needs the specific one and a decision to build it. |

## Adding a new module

Before writing a new `engine/` subsystem: does a real, currently-in-progress
game actually need it? If the answer is "might be useful later," it goes in
this table as Unimplemented, not as code. This repo already has ~30 modules
in that state — the lesson from this session's whole `layout/` rebuild was
that empty scaffolding with a good name is easy to mistake for a finished
decision. Don't add to the pile without a consumer lined up.
BOREDTEACHER_EOF
echo "  wrote engine/MODULES.md"

mkdir -p "$REPO/engine"
cat > "$REPO/engine/CHANGELOG.md" << 'BOREDTEACHER_EOF'
# Changelog

All notable changes to `engine/`. Dates are when the work actually happened,
not version-bump ceremony — this file existed as a 0-byte placeholder before
this entry, so there's no prior history to reconstruct.

## 2026-07-18 — Responsive layout system

- Built out `engine/layout/`'s five stub tier files (`Mobile`, `Tablet`,
  `Desktop`, `LargeDesktop`, `TVLayout`) plus the `ResponsiveLayout`
  dispatcher and public `GameLayout` entry component. All five were 0 bytes
  and had zero references anywhere in the app before this.
- Added `GameHeader`, `GameSidebar`, `GameBottomBar`, `GameShell` as default
  building blocks for the layout's slots.
- Wired BlockFight in as the first real consumer, using `GameLayout`
  directly (custom HUD) rather than `GameShell`'s defaults.
- Fixed two visual bugs found by manual testing: play-area content wasn't
  vertically centering (fixed by making `.game-layout-play-area` itself a
  centering flex container), and `controls` content was folded into the
  sidebar column on desktop/TV, which looked wrong for a passive text
  caption (BlockFight's keyboard hint) as opposed to real interactive
  controls — moved to a bottom caption row at every tier instead.

## 2026-07-18 — Public API and dependency rules

- Wrote `engine/index.ts` as a curated barrel export — previously 0 bytes.
  Only `core`'s registry/loader/adapter and all of `layout` are exported;
  everything else stays internal.
- Added `no-restricted-imports` rules to `eslint.config.mjs` enforcing the
  Engine → SDK → Games → App dependency direction for `engine/**` and
  `games/**`.
- Added `MODULES.md` classifying every subsystem folder's real status —
  most of `engine/` (~30 folders) is unimplemented scaffolding.
BOREDTEACHER_EOF
echo "  wrote engine/CHANGELOG.md"

mkdir -p "$REPO/engine"
cat > "$REPO/engine/CONTRIBUTING.md" << 'BOREDTEACHER_EOF'
# Contributing to engine/

## The rule for adding a module

Don't add a new `engine/` subsystem speculatively. This repo already has
~30 empty subsystem folders (see `MODULES.md`) — good names, zero behavior,
zero consumers. Before writing one:

1. Is there a real, currently-in-progress game that needs it?
2. Could it live in that game's own folder instead of `engine/` for now?
3. If it genuinely belongs in the engine, does it have at least one real
   caller in the same change that adds it?

If you can't answer yes to (1) and (3), it goes in `MODULES.md` as a status
note, not as code.

## Dependency direction

`engine/` → `games/sdk` → `games/` → `app/`. Never the reverse. This is
enforced by `eslint.config.mjs`'s `no-restricted-imports` rules for
`engine/**` and `games/**` — a violation is a lint error, not just a code
review comment. `hooks/`, `config/`, `types/`, `lib/`, `constants/` are a
shared foundation layer, exempt from this in both directions. See
`ARCHITECTURE.md` for the full reasoning.

## Public API

Only `engine/index.ts` is the supported import surface. Adding a new export
there is a deliberate decision — update it in the same change that adds the
thing being exported, and update `MODULES.md`'s status for that module at
the same time.
BOREDTEACHER_EOF
echo "  wrote engine/CONTRIBUTING.md"

mkdir -p "$REPO/games/block-fight"
cat > "$REPO/games/block-fight/BlockFight.tsx" << 'BOREDTEACHER_EOF'
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameLayout } from '@/engine';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import { PLATFORMS } from './data/levels';
import { drawGame } from './systems/rendering';
import { createInitialState, createInitialUi } from './systems/spawning';
import { type GameState, type GameUi } from './systems/types';
import { updateCollectibles, updateWinCondition } from './hooks/useCollision';
import { useControls } from './hooks/useControls';
import { updateEnemies } from './hooks/useEnemies';
import { updatePhysics } from './hooks/usePhysics';

type BlockFightProps = {
  onComplete?: (score: number, accuracy: number) => void;
};

export default function BlockFight({ onComplete }: BlockFightProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const [ui, setUi] = useState<GameUi>(createInitialUi);

    const restart = useCallback(() => {
    stateRef.current = createInitialState();
    setUi(createInitialUi());
  }, []);

  const controlsRef = useControls(stateRef, restart);

  // Report the result back to the game page once the run ends.
  useEffect(() => {
    if (ui.state === 'win') onComplete?.(ui.score, 100);
    else if (ui.state === 'dead') onComplete?.(ui.score, 0);
  }, [ui.state, ui.score, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;
    const ctx: CanvasRenderingContext2D = context;

    let animationId = 0;
    stateRef.current = createInitialState();

    function update() {
      const state = stateRef.current;
      if (!state || state.gameState !== 'playing') return;

      updatePhysics(state, controlsRef.current, PLATFORMS, setUi);
      if (state.gameState !== 'playing') return;

      updateEnemies(state, PLATFORMS, setUi);
      updateCollectibles(state, setUi);
      updateWinCondition(state, setUi);
    }

    function loop() {
      const state = stateRef.current;
      if (state) {
        update();
        drawGame(ctx, state, PLATFORMS);
      }
      animationId = requestAnimationFrame(loop);
    }

    loop();

    return () => cancelAnimationFrame(animationId);
  }, [controlsRef]);

  return (
    <GameLayout
      header={<HUD score={ui.score} hp={ui.hp} />}
      controls={
        <p style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
          ← → Move &nbsp;·&nbsp; ↑ / Space Jump &nbsp;·&nbsp; X / Shift Attack &nbsp;·&nbsp; R Restart
        </p>
      }
    >
      <div style={{
        minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#020617', fontFamily: "'Segoe UI', sans-serif", padding: 16, borderRadius: 12,
      }}>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={424}
            style={{ border: '2px solid #1e293b', borderRadius: 12, display: 'block', maxWidth: '100%', height: 'auto' }}
          />

          {ui.state !== 'playing' && (
            <GameOver score={ui.score} state={ui.state} onRestart={restart} />
          )}
        </div>
      </div>
    </GameLayout>
  );
}
BOREDTEACHER_EOF
echo "  wrote games/block-fight/BlockFight.tsx"

echo ""
echo "Done. Run: cd \"$REPO\" && npm run build"
