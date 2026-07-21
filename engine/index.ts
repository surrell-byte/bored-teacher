// engine/index.ts
//
// The engine's entire public API. If it's not exported here, it's internal —
// import from a subpath directly and you're depending on an implementation
// detail that can change without warning.
//
// This file only re-exports what's actually real. `engine/` contains ~30
// other subsystem folders (physics, ai, audio, quests, weather, ...) — see
// MODULES.md. They're empty scaffolding with zero references anywhere in
// the app. They're deliberately NOT exported here; add them only once a
// real game needs one, not speculatively.

// Core — game registration, loading, and the plain-object game contract.
export {
  registerGame,
  getGame,
  getGames,
} from './core/GameRegistry';
export { loadGame } from './core/GameLoader';
export { createGame } from './core/createGame';
export { BaseGame } from './core/BaseGame';
export { createReactGame } from './core/adapters/ReactGameAdapter';
export type {
  GameConfig,
  GameState,
  GameInstance,
  GameDefinition,
} from './core/types';
export type { GameManifest } from './core/GameManifest';

// Layout — the responsive tier system. See layout/GameLayout.tsx.
export { default as GameLayout } from './layout/GameLayout';
export { default as GameShell } from './layout/GameShell';
export { default as GameHeader } from './layout/GameHeader';
export { default as GameSidebar } from './layout/GameSidebar';
export { default as GameBottomBar } from './layout/GameBottomBar';
export type { GameLayoutProps, GameLayoutSlots } from './layout/GameLayout';
export type { GameHeaderProps } from './layout/GameHeader';
export type { GameSidebarProps, GameStat } from './layout/GameSidebar';
export type { GameBottomBarProps, GameButton } from './layout/GameBottomBar';
export type { GameShellProps } from './layout/GameShell';
