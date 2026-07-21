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
