// lib/achievements.ts
// Single source of truth for all achievement definitions.
// Achievements are DERIVED from HubState — never stored separately —
// so they're always consistent and require no migration.

import type { HubState } from '@/lib/gameState';
import { GAME_KEYS } from '@/lib/constants';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;                       // CSS colour string for glow / border
  check: (s: HubState) => boolean;     // pure function, no side-effects
}

export interface AchievementCategory {
  label: string;
  achievements: Achievement[];
}

function gameTotal(s: HubState, field: 'completions'): number {
  return Object.values(s.games).reduce((a, g) => a + (g[field] || 0), 0);
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    label: '🎮 Gameplay',
    achievements: [
      {
        id: 'first_play',
        name: 'First Steps',
        icon: '🎮',
        color: 'var(--teal)',
        description: 'Complete your first game',
        check: s => gameTotal(s, 'completions') >= 1,
      },
      {
        id: 'play_5',
        name: 'Getting Started',
        icon: '🗂️',
        color: 'var(--blue)',
        description: 'Complete 5 different games',
        check: s => Object.values(s.games).filter(g => g.completions > 0).length >= 5,
      },
      {
        id: 'play_10',
        name: 'Dedicated',
        icon: '📚',
        color: 'var(--blue)',
        description: 'Complete 10 different games',
        check: s => Object.values(s.games).filter(g => g.completions > 0).length >= 10,
      },
      {
        id: 'play_all',
        name: 'All-Rounder',
        icon: '🌍',
        color: 'var(--gold)',
        description: 'Play every single game',
        check: s => GAME_KEYS.every(k => (s.games[k]?.completions ?? 0) > 0),
      },
      {
        id: 'complete_50',
        name: 'Champion',
        icon: '🏅',
        color: 'var(--coral)',
        description: '50 total game completions',
        check: s => gameTotal(s, 'completions') >= 50,
      },
      {
        id: 'complete_100',
        name: 'Legend',
        icon: '💫',
        color: 'var(--gold)',
        description: '100 total game completions',
        check: s => gameTotal(s, 'completions') >= 100,
      },
    ],
  },
  {
    label: '🎯 Accuracy',
    achievements: [
      {
        id: 'acc_70',
        name: 'Decent Shot',
        icon: '🎯',
        color: 'var(--green)',
        description: '70%+ accuracy in any game',
        check: s => Object.values(s.games).some(g => g.highScore >= 70),
      },
      {
        id: 'acc_80',
        name: 'Sharp',
        icon: '🔥',
        color: 'var(--coral)',
        description: '80%+ accuracy in any game',
        check: s => Object.values(s.games).some(g => g.highScore >= 80),
      },
      {
        id: 'acc_90',
        name: 'On Fire',
        icon: '⚡',
        color: 'var(--gold)',
        description: '90%+ accuracy in any game',
        check: s => Object.values(s.games).some(g => g.highScore >= 90),
      },
      {
        id: 'geography_legend',
        name: 'Geography Legend',
        icon: '🌍',
        color: 'var(--teal)',
        description: 'Score 100% in Flagmaster',
        check: s => (s.games['flagmaster']?.highScore ?? 0) >= 100,
      },
      {
        id: 'perfect',
        name: 'Perfectionist',
        icon: '💯',
        color: 'var(--gold)',
        description: '100% accuracy in any game',
        check: s => Object.values(s.games).some(g => g.highScore >= 100),
      },
      {
        id: 'avg_80',
        name: 'Consistently Good',
        icon: '📊',
        color: 'var(--teal)',
        description: '80%+ avg accuracy across 5+ games',
        check: s => {
          const played = Object.values(s.games).filter(g => g.highScore > 0);
          return played.length >= 5 &&
            played.reduce((a, g) => a + g.highScore, 0) / played.length >= 80;
        },
      },
    ],
  },
  {
    label: '🌟 Mastery',
    achievements: [
      {
        id: 'grammar_rookie',
        name: 'Grammar Rookie',
        icon: '🏆',
        color: 'var(--green)',
        description: 'Score 100+ points in a grammar game',
        check: s => ['warriors', 'neonbridge', 'memory'].some(
          k => (s.games[k]?.highScore ?? 0) >= 100
        ),
      },
      {
        id: 'vocabulary_master',
        name: 'Vocabulary Master',
        icon: '📚',
        color: 'var(--blue)',
        description: '85%+ in 5 or more vocabulary games',
        check: s => ['unicorn','wordmatch','colourclash','emojimatch','familyquest',
          'foodwordhunt','fruitwordhunt','lakersracer','tornado']
          .filter(k => (s.games[k]?.highScore ?? 0) >= 85).length >= 5,
      },
      {
        id: 'animal_expert',
        name: 'Animal Expert',
        icon: '🦁',
        color: 'var(--teal)',
        description: 'Complete Animal Kingdom Quest',
        check: s => (s.games['animal']?.completions ?? 0) >= 1,
      },
      {
        id: 'master_grammar',
        name: 'Grammar Guru',
        icon: '✍️',
        color: 'var(--green)',
        description: '85%+ in any grammar game',
        check: s => ['warriors', 'neonbridge', 'memory'].some(
          k => (s.games[k]?.highScore ?? 0) >= 85
        ),
      },
      {
        id: 'master_science',
        name: 'Science Whiz',
        icon: '🔬',
        color: 'var(--teal)',
        description: '85%+ in any science game',
        check: s => ['animal','animalclass','oceanquest','deepseaReveal'].some(
          k => (s.games[k]?.highScore ?? 0) >= 85
        ),
      },
      {
        id: 'master_phonics',
        name: 'Phonics Pro',
        icon: '🔊',
        color: 'var(--coral)',
        description: '85%+ in any phonics game',
        check: s => ['phonicsadventure', 'phonicsworld'].some(
          k => (s.games[k]?.highScore ?? 0) >= 85
        ),
      },
      {
        id: 'polymath',
        name: 'Polymath',
        icon: '🧠',
        color: 'var(--gold)',
        description: '85%+ in 10 or more different games',
        check: s => Object.values(s.games).filter(g => g.highScore >= 85).length >= 10,
      },
    ],
  },
  {
    label: '⭐ Progression',
    achievements: [
      {
        id: 'streak_7',
        name: '7-Day Streak',
        icon: '🔥',
        color: 'var(--coral)',
        description: 'Play for 7 consecutive days',
        check: s => (s.loginStreak || 0) >= 7,
      },
      {
        id: 'streak_30',
        name: 'Monthly',
        icon: '🌈',
        color: 'var(--purple)',
        description: '30-day login streak',
        check: s => (s.loginStreak || 0) >= 30,
      },
      {
        id: 'level_5',
        name: 'Rising Star',
        icon: '⭐',
        color: 'var(--green)',
        description: 'Reach Level 5',
        check: s => s.level >= 5,
      },
      {
        id: 'level_10',
        name: 'Veteran',
        icon: '🌟',
        color: 'var(--blue)',
        description: 'Reach Level 10',
        check: s => s.level >= 10,
      },
      {
        id: 'level_20',
        name: 'Elite',
        icon: '🏆',
        color: 'var(--gold)',
        description: 'Reach Level 20',
        check: s => s.level >= 20,
      },
      {
        id: 'coins_500',
        name: 'Coin Hoarder',
        icon: '🪙',
        color: 'var(--gold)',
        description: 'Collect 500 coins',
        check: s => s.coins >= 500,
      },
    ],
  },
];

// Flat list — useful for lookups and the Navbar counter
export const ACHIEVEMENTS: Achievement[] = ACHIEVEMENT_CATEGORIES.flatMap(c => c.achievements);

/** Returns the set of earned achievement IDs for a given state. Pure, no side-effects. */
export function getEarnedIds(state: HubState): Set<string> {
  return new Set(ACHIEVEMENTS.filter(a => a.check(state)).map(a => a.id));
}

/** Compares two earned sets and returns IDs that are newly unlocked. */
export function getNewlyUnlocked(before: Set<string>, after: Set<string>): Achievement[] {
  return ACHIEVEMENTS.filter(a => !before.has(a.id) && after.has(a.id));
}
