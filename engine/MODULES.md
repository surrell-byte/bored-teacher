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
