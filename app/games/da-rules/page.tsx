'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { GAME_COVERS, GAME_DESC, GAME_DIFFICULTY, GAME_KEYS, GAME_NAMES, GAME_TAGS } from '@/constants/index';

const QUICK_RULES: Partial<Record<string, string>> = {
  alphabethunt: 'Flip tiles in turns, find your own target, and score points before the other player does.',
  powerpointslide: 'Work through slide-style quiz rounds and answer correctly to complete the challenge.',
  miniracer: 'Steer, avoid the edges, and complete three laps without crashing.',
  tilelanes: 'Pick tiles to knock down pins and build the highest score before time ends.',
  bowlingbattle: 'Take turns aiming and timing each throw to knock down all ten pins.',
  tilebattle: 'Flip tiles to trigger attacks, heals, and power effects in a duel.',
  quiztrail: 'Answer general knowledge questions while moving up a timed trail.',
  generalknowledgequiz: 'Play through multiple trivia rounds and build prize money with correct answers.',
  findtheword: 'Watch the cards, remember the hidden word, and spot it before the timer ends.',
  lookandsay: 'Look at the picture and choose the sentence that matches it best.',
  emojisportsquiz: 'Use emoji clues and word tasks to answer sports questions and finish each round.',
  snowyslopes: 'Match sounds, letters, and word patterns while racing through phonics challenges.',
  unicorn: 'Match vocabulary quickly under pressure and finish each level with a great score.',
  warriors: 'Choose the correct grammar answer and climb through tougher challenges.',
  compound: 'Combine clues to build complete compound words.',
  wordmatch: 'Match each word to the right meaning before the timer runs out.',
  angryverbs: 'Pick the correct verb to stop the pig before it steals your points.',
  memory: 'Flip cards, remember what you saw, and match pairs to clear the board.',
  missingfruit: 'Study the sequence, spot the missing item, and choose the correct answer.',
  animalclass: 'Sort animals into the correct groups and build science and vocabulary knowledge.',
  colourclash: 'Match colours, build patterns, and outsmart the other player with smart choices.',
  colourclash2: 'Use streaks, power tiles, and strategy to beat the other player.',
  hiddencolours: 'Reveal tiles, find your colour, and use clever moves to win.',
  crimsonduel: 'Compete head-to-head to name colours faster and beat the rival.',
  archersduel: 'Aim, score, and race to 200 points in a classroom archery battle.',
  deepseaReveal: 'Answer vocabulary questions correctly to reveal hidden sea creatures.',
  dragonslingshot: 'Launch dragons with magical powers and win fantasy arena challenges.',
  emojimatch: 'Match each emoji to the right English word and keep your memory sharp.',
  wordfusion: 'Use emoji clues to build the correct compound word.',
  emojispelling: 'Decode the clue, spell the answer correctly, and move through the challenge.',
  familyquest: 'Learn family vocabulary while progressing through a themed quest.',
  farmgame: 'Explore farm-life vocabulary through quick interactive challenges.',
  plantvegetablequiz: 'Answer plant and vegetable questions in flashcards, spelling, and quiz rounds.',
  findmyfood: 'Read each clue and identify the correct food item.',
  flagmaster: 'Match flags with countries and build geography vocabulary.',
  foodwordhunt: 'Search the grid for hidden food words and sharpen spelling.',
  fruitwordhunt: 'Find fruit names hidden in the letters and spot them quickly.',
  lakersracer: 'Answer correctly to race toward the basket and win the round.',
  neonbridge: 'Choose the correct answer before time runs out and cross the bridge.',
  oceanquest: 'Classify ocean words and answers through an underwater challenge.',
  pacman: 'Move through the maze, answer prompts, and avoid ghosts while collecting points.',
  phonicsadventure: 'Practise letter sounds and blends as you move through a phonics journey.',
  phonicsworld: 'Build reading confidence by matching sounds, letters, and patterns.',
  shuttlecock: 'Smash the correct answer in a badminton-style challenge and keep momentum.',
  tornado: 'Answer quickly before the storm sweeps away your score.',
  wgrandprix: 'Answer correctly and race to the finish line before the field pulls away.',
  turbodash: 'Pick a vehicle, roll the dice, and race around the board while collecting boosts.',
  volcanoracer: 'Use cards to gain ground, freeze rivals, and trigger boosts to the finish.',
  countadd: 'Count and add quickly to solve early numeracy challenges.',
  moneyblocks: 'Reveal money blocks, manage risk, and build the biggest total.',
  parachutedrop: 'Roll, stop, and choose your parachute values to outscore the other player.',
  superwings: 'Race colourful planes around the board and move ahead of the other player.',
  swampjump: 'Time your jumps carefully and chase a high score through the swamp.',
  treasurechest: 'Choose chests, collect rewards, and build the biggest treasure haul.',
  unicornwings: 'Race unicorns, roll well, and beat the other player to the finish.',
  connect4: 'Drop discs to create four in a row and block your opponent.',
  monkeytree: 'Time your jumps and climb as high as possible without falling.',
  blockfight: 'Choose smart moves quickly and win a tough reflex battle.',
  feedmonster: 'Count the correct number of apples and feed the hungry monster.',
  numberclouds: 'Fill in the missing number in each cloud pattern.',
  vocabvalley: 'Use flashcards and practice tasks to learn new words across categories.',
  bubblepop: 'Pop the target number of bubbles before the round ends.',
  buildtower: 'Arrange blocks from smallest to biggest and build the tallest tower.',
  mathracing: 'Answer arithmetic questions quickly and race to the finish line.',
  weatherwizard: 'Learn weather words, seasons, and sentence skills across magical levels.',
  pizzafractions: 'Match each fraction to the right pizza slice before the order is served.',
  fishingnumbers: 'Catch the fish that matches the target total and build a bigger score.',
  shapebuilder: 'Place shapes, count them, and answer quick geometry questions.',
  higherorlower: 'Guess whether the next card is higher or lower and keep a streak alive.',
  picturerace: 'Match pictures to English words quickly and beat the timer.',
  redorblack: 'Call red or black before each card flips and keep your nerve.',
  sentencebuilder: 'Rearrange the scrambled words into a correct sentence.',
  tankwars: 'Type the correct vocabulary word to power your tank and beat the AI.',
  zoogame: 'Guess, act, and identify animals from zoo, farm, and sea categories.',
  tictacroll: 'Roll dice, place your marks, and beat the other player in a dice-based twist on tic-tac-toe.',
  animalAdventureRace: 'Move across the board by matching colours and collecting boosts while avoiding traps.',
  whatami: 'Study the clues and work out the mystery object or creature.',
  descriptiondetective: 'Read clue cards, choose the best answer, and solve each case file.',
  whatsmissing: 'Study the picture carefully and spot what is missing.',
  findthebee: 'Search for the hidden bee before your hearts run out.',
  riddlebombs: 'Solve timed riddles, build streaks, and defuse the bomb before the fuse ends.',
  tonguetwister: 'Hear, say, and type tongue twisters with increasing speed and accuracy.',
  finnthefox: 'Read the story, answer the questions, and help the fox continue the journey.',
  monsterbound: 'Travel through the wild frontier, catch monsters, and build a winning team.',
  pluralquest: 'Progress through plural noun rules from simple endings to tricky irregular forms.',
  victoryvet: 'Answer animal-care questions to help patients and build knowledge.',
  airpuck: 'Play fast air hockey or switch to a card mode and be the first to score seven.',
};

const FULL_RULES: Partial<Record<string, string>> = {
  alphabethunt: 'Players take turns revealing tiles. Each player tries to find their own avatar or target before the opponent finds theirs. Correct picks can score points and reward another turn, while risky choices can pass the turn to the other player.',
  miniracer: 'Use the controls to accelerate, steer, and survive the track edges. The goal is to finish three laps without crashing and keep your speed under control.',
  tilelanes: 'Players choose tiles that knock down pins. The winner is the player with the highest score after the lane ends, so timing and risk management matter.',
  bowlingbattle: 'Each player bowls a full ten-frame match. The aim is to knock down all the pins as often as possible and beat the opponent total.',
  tilebattle: 'Each turn brings a new tile reveal. Matching the right tile triggers attacks, heals, and lifesteal as players try to knock out the opponent.',
  quiztrail: 'Players answer questions while moving along a trail that gets harder as they progress. The goal is to stay on the trail and reach the end before the clock runs out.',
  airpuck: 'Players either play a fast air hockey mode or switch to a card-based mode. The first player to reach seven points wins the match.',
};

function getRuleText(gameId: string, mode: 'quick' | 'full') {
  if (mode === 'full') return FULL_RULES[gameId] ?? QUICK_RULES[gameId] ?? GAME_DESC[gameId] ?? `Follow the on-screen instructions and aim for the best score in ${GAME_NAMES[gameId]}.`;
  return QUICK_RULES[gameId] ?? GAME_DESC[gameId] ?? `Follow the on-screen instructions and aim for the best score in ${GAME_NAMES[gameId]}.`;
}

export default function DaRulesPage() {
  const [mode, setMode] = useState<'quick' | 'full'>('quick');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    const set = new Set(['All']);
    for (const gameId of GAME_KEYS) {
      const label = GAME_TAGS[gameId]?.label;
      if (label) set.add(label);
    }
    return [...set].sort();
  }, []);

  const filteredGames = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GAME_KEYS.filter((gameId) => {
      const label = GAME_TAGS[gameId]?.label || '';
      const name = GAME_NAMES[gameId] || '';
      const desc = GAME_DESC[gameId] || '';
      const matchesCategory = category === 'All' || label === category;
      const matchesSearch = !q || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || label.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 20px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Game Rule Book</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>Da Rules</h1>
        </div>
        <Link href="/games" style={{ color: 'var(--text)', textDecoration: 'none', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '10px 16px', fontWeight: 600 }}>
          ← Back to games
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', gap: 8, background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: 6 }}>
          {(['quick', 'full'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '9px 14px',
                fontWeight: 700,
                background: mode === value ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {value === 'quick' ? 'Quick Start' : 'Full Rules'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '8px 12px', minWidth: 260, flex: 1, maxWidth: 420 }}>
          <span aria-hidden="true" style={{ fontSize: 16 }}>🔎</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search rules…"
            aria-label="Search rule book"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 14,
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {categories.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setCategory(label)}
            style={{
              borderRadius: 999,
              border: `1px solid ${category === label ? 'rgba(147,197,253,0.7)' : 'rgba(255,255,255,0.12)'}`,
              background: category === label ? 'rgba(96,165,250,0.18)' : 'rgba(255,255,255,0.04)',
              color: 'var(--text)',
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredGames.length === 0 ? (
        <div style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          No games match that search or category. Try a different keyword or switch back to All.
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {filteredGames.map((gameId) => {
          const cover = GAME_COVERS[gameId];
          const tag = GAME_TAGS[gameId];
          const name = GAME_NAMES[gameId] ?? gameId;
          const difficulty = GAME_DIFFICULTY[gameId] ?? 'Mixed';

          return (
            <article
              key={gameId}
              style={{
                background: 'rgba(15, 23, 42, 0.56)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 22,
                overflow: 'hidden',
                boxShadow: '0 18px 40px rgba(15,23,42,0.2)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 176,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  backgroundImage: cover ? `url(${cover})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,10,19,0.15), rgba(7,10,19,0.65))' }} />
                <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  {tag && (
                    <span style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}>
                      {tag.label}
                    </span>
                  )}
                  <span style={{ padding: '6px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(147,197,253,0.25)' }}>
                    {difficulty}
                  </span>
                </div>
              </div>

              <div style={{ padding: 16 }}>
                <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', lineHeight: 1.3 }}>{name}</h2>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7, fontSize: 14 }}>
                  <strong style={{ color: 'var(--text)' }}>How to play:</strong> {getRuleText(gameId, mode)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
      )}
    </main>
  );
}
