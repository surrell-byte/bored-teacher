'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { FIND_THE_LETTER_LEVELS } from './findTheLetterData';
import './find-the-letter.css';

const MISS_MESSAGES = [
  'Not this card. Keep searching!',
  'Good try. There are more cards to check.',
  'No letter here. Have another look!',
  'Nuh-uh! Another card? 👀',
];

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function makeRound(levelIndex) {
  return {
    levelIndex,
    cards: shuffle(FIND_THE_LETTER_LEVELS[levelIndex].cards),
    targetIndex: Math.floor(Math.random() * 4),
    revealed: [],
    lives: 3,
    status: 'playing',
    message: 'Choose a card to find the letter.',
    results: {},
    busy: false,
    shakeId: 0,
    messageId: 0,
    confetti: [],
  };
}

function createInitialState() {
  return {
    levelIndex: 0,
    cards: FIND_THE_LETTER_LEVELS[0].cards,
    targetIndex: 0,
    revealed: [],
    lives: 3,
    status: 'playing',
    message: 'Choose a card to find the letter.',
    results: {},
    busy: false,
    shakeId: 0,
    messageId: 0,
    confetti: [],
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'start':
      return action.round;
    case 'flip':
      if (state.status !== 'playing' || state.busy || state.revealed.includes(action.index)) return state;
      return { ...state, status: 'resolving', busy: true, revealed: [...state.revealed, action.index], pendingIndex: action.index };
    case 'resolve-correct':
      if (state.status !== 'resolving') return state;
      return { ...state, status: 'won', results: { ...state.results, [state.pendingIndex]: 'correct' }, message: `You found ${FIND_THE_LETTER_LEVELS[state.levelIndex].letter}!`, messageId: state.messageId + 1, confetti: action.confetti };
    case 'resolve-wrong': {
      if (state.status !== 'resolving') return state;
      const lives = state.lives - 1;
      return {
        ...state,
        status: lives === 0 ? 'revealPending' : 'playing',
        lives,
        results: { ...state.results, [state.pendingIndex]: 'incorrect' },
        message: lives === 0 ? 'Oh no! Let’s see where it was… 🙈' : action.missMessage,
        messageId: state.messageId + 1,
        shakeId: state.shakeId + 1,
      };
    }
    case 'reveal-answer':
      if (state.status !== 'revealPending') return state;
      return { ...state, status: 'lost', revealed: [...state.revealed, state.targetIndex], results: { ...state.results, [state.targetIndex]: 'correct' }, message: `The ${FIND_THE_LETTER_LEVELS[state.levelIndex].letter} was hiding here.`, messageId: state.messageId + 1 };
    case 'unlock':
      return { ...state, busy: false };
    case 'advance':
      return state.status === 'won' && state.levelIndex < FIND_THE_LETTER_LEVELS.length - 1
        ? action.round
        : state;
    case 'restart':
      return action.round;
    case 'complete':
      return { ...state, status: 'complete', message: 'You found every letter from A to Z!', messageId: state.messageId + 1 };
    default:
      return state;
  }
}

export default function FindTheLetter({ onComplete, onHudUpdate }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const audioContextRef = useRef(null);
  const timersRef = useRef(new Set());
  const busyRef = useRef(false);
  const completionReportedRef = useRef(false);
  const letter = FIND_THE_LETTER_LEVELS[state.levelIndex].letter;
  const isPlaying = state.status === 'playing' || state.status === 'resolving';

  const schedule = useCallback((callback, delay) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    dispatch({ type: 'start', round: makeRound(0) });
    onHudUpdate?.({ active: true, lives: 3 });
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      onHudUpdate?.({ active: false, lives: 0 });
      audioContextRef.current?.close().catch(() => {});
      audioContextRef.current = null;
    };
  }, [onHudUpdate]);

  useEffect(() => {
    onHudUpdate?.({ active: true, lives: state.lives });
  }, [onHudUpdate, state.lives]);

  const playTone = useCallback((frequency, duration = 0.16, waveform = 'sine', delay = 0) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextConstructor) return;
      const context = audioContextRef.current || new AudioContextConstructor();
      audioContextRef.current = context;
      if (context.state === 'suspended') context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime + delay;
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch {
      // Browsers may block audio; gameplay remains available without it.
    }
  }, []);

  const playSequence = (notes) => notes.forEach(([frequency, delay, duration = 0.12, wave = 'sine']) => playTone(frequency, duration, wave, delay));

  const pickCard = (index) => {
    if (!isPlaying || state.busy || busyRef.current || state.revealed.includes(index)) return;
    const correct = index === state.targetIndex;
    busyRef.current = true;
    dispatch({ type: 'flip', index });
    playTone(520, 0.08, 'triangle');
    schedule(() => {
      if (correct) {
        dispatch({ type: 'resolve-correct', confetti: Array.from({ length: 20 }, (_, piece) => ({ id: piece, left: Math.random() * 100, delay: Math.random() * 0.24, emoji: ['🎉', '✨', '⭐', '🎊'][Math.floor(Math.random() * 4)] })) });
        playSequence([[523, 0], [659, 0.11], [784, 0.22], [1047, 0.33]]);
      } else {
        const outOfLives = state.lives === 1;
        dispatch({ type: 'resolve-wrong', missMessage: MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)] });
        playSequence([[220, 0, 0.15, 'triangle'], [165, 0.14, 0.18, 'triangle']]);
        if (outOfLives) {
          playSequence([[660, 0.32, 0.12], [880, 0.47, 0.2]]);
          schedule(() => dispatch({ type: 'reveal-answer' }), 700);
        }
      }
    }, 380);
    schedule(() => { busyRef.current = false; dispatch({ type: 'unlock' }); }, 430);
  };

  const nextLevel = () => {
    if (state.levelIndex === FIND_THE_LETTER_LEVELS.length - 1) {
      if (!completionReportedRef.current) {
        completionReportedRef.current = true;
        onComplete?.(260, 100);
      }
      dispatch({ type: 'complete' });
      return;
    }
    dispatch({ type: 'advance', round: makeRound(state.levelIndex + 1) });
  };

  const playAgain = () => {
    completionReportedRef.current = false;
    dispatch({ type: 'start', round: makeRound(0) });
  };

  return (
    <section className="find-letter-game" aria-label="Find the Letter A to Z">
      <div className="find-letter-intro">
        <h1>Find the hidden letter</h1>
        <p className="find-letter-instruction">Choose the picture whose name begins with</p>
        <div className="find-letter-target" aria-label={`Target letter ${letter}`}>{letter}</div>
      </div>

      <div className={`find-letter-board${state.shakeId ? ` is-shaking shake-${state.shakeId % 2}` : ''}`} role="group" aria-label={`Choose a picture beginning with ${letter}`}>
        {state.cards.map((card, index) => {
          const revealed = state.revealed.includes(index);
          const isTarget = index === state.targetIndex;
          const resultClass = state.results[index] ? `is-${state.results[index]}` : '';
          return (
            <button
              className={`find-letter-card${revealed ? ' is-revealed' : ''} ${resultClass}`}
              type="button"
              key={`${state.levelIndex}-${card.label}`}
              onClick={() => pickCard(index)}
              disabled={!isPlaying || state.busy || revealed}
              aria-label={`${card.label}${revealed ? isTarget ? `, correct, ${letter}` : ', not this one' : ', reveal picture card'}`}
            >
              <span className="find-letter-card-inner">
                <span className="find-letter-card-face find-letter-card-front">
                  <span className="find-letter-emoji" aria-hidden="true">{card.emoji}</span>
                  <span className="find-letter-word">{card.label}</span>
                  <span className="find-letter-tap">TAP TO REVEAL</span>
                </span>
                <span className="find-letter-card-face find-letter-card-back" aria-hidden="true">
                  {isTarget ? <><span className="find-letter-back-mark">✓</span><span className="find-letter-back-letter">{letter}</span><span className="find-letter-back-caption">{card.label}</span></> : <><span className="find-letter-back-mark">×</span><span className="find-letter-back-caption">Try another</span></>}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <footer className={`find-letter-footer is-${state.status}`}>
        <p key={state.messageId} className="find-letter-message" role="status" aria-live="polite">{state.message}</p>
        {state.status === 'won' && <button className="find-letter-action" type="button" onClick={nextLevel}>{state.levelIndex === FIND_THE_LETTER_LEVELS.length - 1 ? 'Finish alphabet' : 'Next letter'} <span aria-hidden="true">→</span></button>}
        {state.status === 'lost' && <button className="find-letter-action" type="button" onClick={() => dispatch({ type: 'restart', round: makeRound(state.levelIndex) })}>Try this letter again <span aria-hidden="true">↻</span></button>}
        {state.status === 'complete' && <div className="find-letter-complete-actions"><button className="find-letter-action" type="button" onClick={playAgain}>Play again <span aria-hidden="true">↻</span></button><button className="find-letter-quiet-button" type="button" onClick={onBack}>Return to menu</button></div>}
      </footer>
      {state.confetti.length > 0 && <div className="find-letter-confetti" aria-hidden="true">{state.confetti.map((piece) => <span key={piece.id} style={{ '--fl-left': `${piece.left}%`, '--fl-delay': `${piece.delay}s` }}>{piece.emoji}</span>)}</div>}
    </section>
  );
}
