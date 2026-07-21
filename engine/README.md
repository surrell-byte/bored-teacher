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
