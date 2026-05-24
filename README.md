# ESL Game Hub — React / Next.js

Converted from the original HTML multi-page app.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## File structure

```
esl-game-hub/
├── app/
│   ├── globals.css           ← All themes + shared CSS classes
│   ├── layout.tsx            ← Root layout wrapping GameProvider
│   ├── page.tsx              ← Splash screen + auth redirect  (was index.html)
│   ├── auth/page.tsx         ← Sign in / Register / Guest     (was auth.html)
│   ├── hub/page.tsx          ← Main game hub                  (was hub.html)
│   ├── games/[gameId]/
│   │   └── page.tsx          ← Full-screen iframe game player  (was game.html)
│   ├── leaderboard/page.tsx  ← Class leaderboard              (was leaderboard.html)
│   ├── trophy/page.tsx       ← Badge & tier tracker           (was trophy.html)
│   └── resources/page.tsx   ← Teaching resources              (was resources.html)
│
├── components/
│   ├── GameCard.tsx          ← Individual game card
│   ├── Navbar.tsx            ← Top navigation bar
│   ├── ProfileModal.tsx      ← Edit name, username, avatar
│   └── Toast.tsx             ← Global notification toast
│
└── lib/
    ├── constants.ts          ← All game data (names, icons, tags, URLs…)
    ├── firebase.ts           ← Firebase SDK wrapper
    ├── gameState.tsx         ← Global React context (replaces main.js)
    └── leaderboard.ts        ← Class leaderboard helpers
```

## Important notes

- Your game HTML files go in the `public/` folder so the iframe in
  `app/games/[gameId]/page.tsx` can load them (e.g. `public/games/unicorn-trophy-run/unicorn.html`)
- Firebase config is already embedded in `lib/firebase.ts`
- All 11 themes work via the theme selector in the Navbar
