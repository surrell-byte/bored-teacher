# ESL Game Hub — React / Next.js

Converted from the original HTML multi-page app.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Transactional email

Account verification, password reset, support receipts, and account deletion
notices are sent from `boredteacherapp@gmail.com`. Configure these values in
`.env.local` for local development and in the deployment's secret settings:

```env
GMAIL_USER=boredteacherapp@gmail.com
GMAIL_APP_PASSWORD=your-google-app-password
FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON=your-service-account-json
```

Create a Google App Password for the `boredteacherapp@gmail.com` account (with
two-step verification enabled). Do not use the account's normal password or
commit either secret. The Firebase Admin service account must belong to the same
Firebase project as the `NEXT_PUBLIC_FIREBASE_*` configuration. Firebase
authorized domains must include the app's domain so password-reset links can
return to the app.

Signed-in users can permanently delete their accounts from **Profile** after
confirming their password. The deletion endpoint rechecks recent authentication
and removes the account's profile, game progress, reviews, support messages,
class records, and league/lobby memberships.

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

## Game quality assurance

Use the game QA scripts for focused release checks:

```bash
npm run qa:assets
npm run qa:featured
npm run qa:games
npm run qa:release
```

- `qa:assets` audits direct image, audio, icon, and font asset references.
- `qa:featured` completes the Flagmaster featured-game route at mobile, tablet, and desktop viewports.
- `qa:games` smoke-tests every available catalog game across mobile, tablet, desktop, and short-landscape viewports.
- `qa:release` is the minimum automated release gate: catalog checks, asset audit, and regression tests.
