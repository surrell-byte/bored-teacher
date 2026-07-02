# Games

New games should use this shape:

```text
game-slug/
  components/
  hooks/
  assets/
    images/
    sounds/
    music/
  data/
  engine/
  GameName.tsx
```

`block-fight/` already follows this pattern closely. Older games can be migrated
incrementally when they are next touched, while public iframe assets stay under
`public/games/` so existing URLs keep working.
