# Money Blocks — Project Structure Notes

This project was reorganized from a flat collection of files into the `src/`
layout below. A few things worth knowing if you're picking this up:

## What was merged

Two different versions of the game logic existed across the uploaded files:

- **`setup_project.sh`** scaffolded a `GameContext` API with `reset()`,
  `goToSetup()`, `startGame()`, `revealBlock()`, and flat ledger fields
  (`lastEyebrow`, `lastAmountChange`, `lastActorName`, `message`).
- **`money-blocks.zip`** contained an earlier draft with a `dispatch`-only
  `GameContext`, a `RESET` action, and a nested `state.ledger` object.

The six uploaded HUD/Scoreboard components (`Scoreboard.tsx`, `Ledger.tsx`,
`PlayerCard.tsx`, `TurnPill.tsx`, `SideControls.tsx`, `HowToPlayModal.tsx`)
were written against the **script's** API, so that's what `src/context/`,
`src/game/`, `src/hooks/`, `src/services/`, and `src/utils/` use. The
underlying game rules (rewards, multipliers, black-card events, block
layout) were identical between both versions, so nothing about how the game
actually plays was lost in this choice.

One real bug in the zip's assets was caught in the process: its embedded
`green-background.webp` was truncated (3.7KB vs. the real ~50KB file). The
full-size original from the zip is what's in `src/assets/backgrounds/` now.

## What was newly built

These didn't exist in either source and were built to match the existing
CSS (`src/styles/components/*.css`) and game API exactly:

- `components/Board`, `components/Tower`, `components/Block` — the board
  grid, the single-tile component, and the centered flip-reveal overlay.
- `components/ThemeSelector` — swatch row wired to the existing `useTheme()`
  hook and `themes/index.ts` (5 themes: black, white, gold, blue, green).
- `components/Common/WelcomeScreen.tsx`, `SetupScreen.tsx`, `WinnerScreen.tsx`
  — the three full-screen game phases, using the `.welcome-*`, `.setup-*`,
  `.winner-*` classes that were already defined in `screens.css`.
- `components/Animations/Confetti.tsx` — thin wrapper around the existing
  `useParticles` hook for the winner screen.
- `App.tsx`, `main.tsx`, `pages/Game.tsx` — app entry point and the page that
  switches between welcome → setup → playing → ended based on `state.phase`.
- `pages/Home.tsx`, `Settings.tsx`, `Credits.tsx` — placeholders, not
  currently routed to. `App.tsx` renders `Game.tsx` directly as a single-page
  app; these three exist for if/when separate routes are added later.
- Root config (`package.json`, `vite.config.ts`, `tsconfig.json`,
  `index.html`) — none of this existed in the uploads, so it was added to
  make the tree an actually runnable Vite + React + TypeScript project.

## Running it

```
npm install
npm run dev
```

(`npm install` couldn't be verified in the sandbox this was built in — it had
no network access — so dependency versions in `package.json` are sensible
defaults rather than confirmed-working installs. Worth a sanity check on
first run.)
