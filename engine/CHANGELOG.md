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
