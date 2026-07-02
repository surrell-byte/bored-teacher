# Features

Feature folders own code that belongs to one product area. Keep feature-specific UI,
hooks, API helpers, types, and utilities together here instead of spreading them across
top-level `components/` and `lib/`.

Current feature homes:

- `achievements/` - achievement definitions and achievement UI.
- `leaderboard/` - leaderboard persistence, scoring, and remote leaderboard helpers.
- `players/` - player/class-list management UI.
- `profiles/` - profile editing UI.
- `rewards/` - reward calculation helpers.

Use `components/` only for reusable app-wide UI, and keep `lib/` focused on shared
services such as Firebase and the global game state provider.
