'use client';

import { useEffect, useRef, useState } from 'react';
import './tidalDash.css';
import { createTidalSignal, resolveTidalTurn, TIDAL_ACTIONS } from './tidalDashLogic.mjs';

const WIN_SCORE = 5;
const TURN_SECONDS = 5;
const PLAYERS = [
  { name: 'Player 1', color: '#50e2c1', icon: '🐢' },
  { name: 'Player 2', color: '#ffb75e', icon: '🐬' },
];

export default function TidalDash({ onComplete }) {
  const [scores, setScores] = useState([0, 0]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [signal, setSignal] = useState(() => createTidalSignal());
  const [phase, setPhase] = useState('ready');
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const [feedback, setFeedback] = useState(null);
  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [turnCount, setTurnCount] = useState(0);
  const [correctTurns, setCorrectTurns] = useState(0);
  const turnTimer = useRef(null);
  const completionSent = useRef(false);
  const resolveTurnRef = useRef(null);

  useEffect(() => () => window.clearTimeout(turnTimer.current), []);

  function resolveTurn(actionId) {
    if (phase !== 'ready') return;

    const result = resolveTidalTurn(scores, activePlayer, actionId, signal.id, WIN_SCORE);
    const correctAction = TIDAL_ACTIONS.find(({ id }) => id === result.expectedAction);

    setScores(result.scores);
    setTurnCount((count) => count + 1);
    if (result.correct) setCorrectTurns((count) => count + 1);
    setFeedback({
      correct: result.correct,
      timedOut: actionId === null,
      playerName: PLAYERS[activePlayer].name,
      action: correctAction?.label ?? 'the right move',
    });

    if (result.winnerIndex !== -1) {
      setWinnerIndex(result.winnerIndex);
      setPhase('winner');
      return;
    }

    setPhase('feedback');
    turnTimer.current = window.setTimeout(() => {
      setActivePlayer((player) => (player + 1) % PLAYERS.length);
      setSignal(createTidalSignal(undefined, signal.id));
      setTimeLeft(TURN_SECONDS);
      setFeedback(null);
      setPhase('ready');
    }, 1400);
  }

  resolveTurnRef.current = resolveTurn;

  useEffect(() => {
    if (phase !== 'ready') return undefined;
    if (timeLeft <= 0) {
      resolveTurnRef.current?.(null);
      return undefined;
    }

    const timer = window.setTimeout(() => setTimeLeft((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, timeLeft]);

  function restartMatch() {
    window.clearTimeout(turnTimer.current);
    setScores([0, 0]);
    setActivePlayer(0);
    setSignal(createTidalSignal());
    setPhase('ready');
    setTimeLeft(TURN_SECONDS);
    setFeedback(null);
    setWinnerIndex(-1);
    setTurnCount(0);
    setCorrectTurns(0);
    completionSent.current = false;
  }

  function finishMatch() {
    if (winnerIndex === -1 || completionSent.current) return;
    completionSent.current = true;
    const accuracy = turnCount > 0 ? Math.round((correctTurns / turnCount) * 100) : 0;
    onComplete?.(WIN_SCORE, accuracy);
  }

  return (
    <main className="td-root">
      <div className="td-layout">
        <header className="td-heading">
          <div>
            <div className="td-eyebrow">A quick-current challenge</div>
            <h1>Tidal Dash</h1>
          </div>
          <div className="td-turn-badge" aria-live="polite">
            {phase === 'winner' ? 'Race finished' : `${PLAYERS[activePlayer].name}'s turn`}
          </div>
        </header>

        <div className="td-scoreboard" aria-label="Race scores">
          {PLAYERS.map((player, index) => (
            <section
              className={`td-player-card${activePlayer === index && phase !== 'winner' ? ' is-active' : ''}`}
              key={player.name}
              style={{ '--td-player-color': player.color }}
              aria-current={activePlayer === index && phase !== 'winner' ? 'step' : undefined}
            >
              <span className="td-player-icon" aria-hidden="true">{player.icon}</span>
              <span className="td-player-name">{player.name}</span>
              <span className="td-player-score">{scores[index]}<small> / {WIN_SCORE}</small></span>
              <span className="td-progress" aria-label={`${scores[index]} of ${WIN_SCORE} steps`}>
                <span style={{ width: `${(scores[index] / WIN_SCORE) * 100}%` }} />
              </span>
            </section>
          ))}
        </div>

        <section className="td-rules td-panel" aria-label="How to play">
          <strong>Read the current, then make the right move before time runs out.</strong>
          <span>Surge → Paddle</span>
          <span>Slack tide → Anchor</span>
          <span>Crosscurrent → Steer</span>
          <span>First crew to {WIN_SCORE} steps wins.</span>
        </section>

        <section className="td-race td-panel" aria-label="Race progress">
          <div className="td-race-labels"><span>START</span><span>REEF FINISH</span></div>
          {PLAYERS.map((player, index) => (
            <div className="td-lane" key={player.name} style={{ '--td-player-color': player.color }}>
              <span className="td-lane-name">{player.name}</span>
              <span className="td-lane-track">
                <span className="td-lane-fill" style={{ width: `${(scores[index] / WIN_SCORE) * 100}%` }} />
                <span className="td-boat" style={{ left: `${Math.min(94, (scores[index] / WIN_SCORE) * 100)}%` }} aria-hidden="true">
                  {player.icon}
                </span>
              </span>
            </div>
          ))}
        </section>

        <section className={`td-current-card td-panel${phase === 'ready' ? ' is-ready' : ''}`} aria-live="polite">
          <div className="td-current-label">
            {phase === 'ready' ? 'CURRENT SIGNAL' : phase === 'feedback' ? 'TIDE REPORT' : 'RACE COMPLETE'}
          </div>
          <div className="td-current-icon" aria-hidden="true">
            {phase === 'feedback' && feedback?.correct ? '✨' : signal.icon}
          </div>
          <h2>{phase === 'feedback' ? (feedback?.correct ? 'Nice navigation!' : 'The current changed!') : signal.name}</h2>
          <p>
            {phase === 'feedback'
              ? feedback?.correct
                ? `${feedback.playerName} reads the water and moves one step ahead.`
                : feedback?.timedOut
                  ? `Time ran out. Next time, ${feedback.action.toLowerCase()}!`
                  : `Not quite! The right move was ${feedback.action.toLowerCase()}.`
              : signal.message}
          </p>
          {phase === 'ready' && (
            <div className="td-countdown" aria-label={`${timeLeft} seconds remaining`}>
              <span style={{ '--td-time-left': `${(timeLeft / TURN_SECONDS) * 100}%` }} />
              <b>{timeLeft}</b>
            </div>
          )}
        </section>

        <div className="td-actions" aria-label="Choose your move">
          {TIDAL_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="td-action-button"
              onClick={() => resolveTurn(action.id)}
              disabled={phase !== 'ready'}
              aria-label={action.label}
            >
              <span aria-hidden="true">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        <p className="td-turn-note" aria-live="polite">
          {phase === 'ready'
            ? `Make your move, ${PLAYERS[activePlayer].name}!`
            : phase === 'feedback'
              ? 'Passing the helm to the next player…'
              : 'The best navigator reaches the reef!'}
        </p>

        {phase === 'winner' && (
          <div className="td-winner-backdrop">
            <section className="td-winner-card td-panel" role="dialog" aria-modal="true" aria-labelledby="td-winner-title">
              <div className="td-winner-icon" aria-hidden="true">🏆</div>
              <div className="td-eyebrow">Champion navigator</div>
              <h2 id="td-winner-title">{PLAYERS[winnerIndex].name} wins the dash!</h2>
              <p>They read the changing currents and reached the reef first.</p>
              <div className="td-winner-actions">
                <button type="button" className="td-primary-button" onClick={restartMatch}>Race again</button>
                <button type="button" className="td-secondary-button" onClick={finishMatch}>Finish match</button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
