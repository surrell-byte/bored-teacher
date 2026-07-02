# Constants

Shared constants live here instead of `lib/`. As the file grows, split `index.ts`
into focused modules such as `games.ts`, `routes.ts`, `achievements.ts`, and
`rewards.ts`, then re-export them from `index.ts`.
