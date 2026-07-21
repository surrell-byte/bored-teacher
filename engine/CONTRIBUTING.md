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
