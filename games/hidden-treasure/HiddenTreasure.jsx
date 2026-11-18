'use client';

import { useEffect, useRef, useState } from 'react';
import './hiddenTreasure.css';
import { createTreasureBoard, scoreTreasureGuess, TREASURE_SHAPES } from './hiddenTreasureLogic.mjs';

const INITIAL_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const PLAYER_COLORS = ['#35dfad', '#ff6b73', '#55c8ff', '#d08aff'];

function ShapeIcon({ shapeId, className = '' }) {
  const paths = {
    circle: <circle cx="32" cy="32" r="22" />,
    triangle: <path d="M32 8 57 54H7L32 8Z" />,
    square: <rect x="11" y="11" width="42" height="42" rx="4" />,
    star: <path d="m32 5 8 18 19 2-14 13 4 19-17-10-17 10 4-19L5 25l19-2 8-18Z" />,
    diamond: <path d="M32 5 58 32 32 59 6 32 32 5Z" />,
  };

  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {paths[shapeId]}
    </svg>
  );
}

export default function HiddenTreasure({ onComplete }) {
  const [screen, setScreen] = useState('welcome');
  const [playerCount, setPlayerCount] = useState(4);
  const [nameDrafts, setNameDrafts] = useState(INITIAL_NAMES);
  const [players, setPlayers] = useState(INITIAL_NAMES);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [tiles, setTiles] = useState(() => createTreasureBoard());
  const [activePlayer, setActivePlayer] = useState(0);
  const [selectedShape, setSelectedShape] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [guessCount, setGuessCount] = useState(0);
  const turnTimer = useRef(null);
  const completionSent = useRef(false);

  useEffect(() => () => window.clearTimeout(turnTimer.current), []);

  function startRound() {
    window.clearTimeout(turnTimer.current);
    const nextPlayers = nameDrafts.slice(0, playerCount).map((name, index) => (
      name.trim() || `Player ${index + 1}`
    ));
    setPlayers(nextPlayers);
    setScores(nextPlayers.map(() => 0));
    setTiles(createTreasureBoard());
    setActivePlayer(0);
    setSelectedShape(null);
    setFeedback(null);
    setWinnerIndex(-1);
    setCorrectGuesses(0);
    setGuessCount(0);
    completionSent.current = false;
    setScreen('game');
  }

  function revealTile(tile) {
    if (selectedShape === null || feedback || winnerIndex !== -1 || tile.revealed) return;

    const result = scoreTreasureGuess(scores, activePlayer, selectedShape, tile.shapeId);
    const shape = TREASURE_SHAPES.find(({ id }) => id === tile.shapeId);
    const nextCorrectGuesses = correctGuesses + Number(result.correct);
    const nextGuessCount = guessCount + 1;

    setScores(result.scores);
    setTiles((currentTiles) => currentTiles.map((currentTile) => (
      currentTile.id === tile.id ? { ...currentTile, revealed: true } : currentTile
    )));
    setCorrectGuesses(nextCorrectGuesses);
    setGuessCount(nextGuessCount);
    setSelectedShape(null);
    setFeedback({
      correct: result.correct,
      playerName: players[activePlayer],
      guessedShape: TREASURE_SHAPES.find(({ id }) => id === selectedShape)?.name,
      shapeName: shape?.name ?? 'shape',
      tileNumber: tile.number,
    });

    if (result.winnerIndex !== -1) {
      setWinnerIndex(result.winnerIndex);
      return;
    }

    const isLastTile = tiles.every((currentTile) => currentTile.revealed || currentTile.id === tile.id);
    turnTimer.current = window.setTimeout(() => {
      setActivePlayer((currentPlayer) => (currentPlayer + 1) % players.length);
      setFeedback(null);
      if (isLastTile) setTiles(createTreasureBoard());
    }, 1400);
  }

  function finishRound() {
    if (winnerIndex === -1 || completionSent.current) return;
    completionSent.current = true;
    const accuracy = guessCount > 0 ? Math.round((correctGuesses / guessCount) * 100) : 0;
    onComplete?.(3, accuracy);
  }

  return (
    <main className="ht-root">
      {screen === 'welcome' ? (
        <section className="ht-welcome ht-panel" aria-labelledby="ht-title">
          <div className="ht-kicker">A shape-guessing sea adventure</div>
          <h1 id="ht-title">Hidden Treasure</h1>
          <p className="ht-intro">
            Pick a shape, choose a numbered treasure, and see if your guess is right.
            First player to find 3 shapes wins the round!
          </p>

          <div className="ht-how-to">
            <span><b>1</b> Pick the shape you think is hidden.</span>
            <span><b>2</b> Choose any numbered tile.</span>
            <span><b>3</b> Get it right to score a point.</span>
          </div>

          <div className="ht-player-setup">
            <div className="ht-setup-heading">
              <span>Players</span>
              <div className="ht-player-count" aria-label="Number of players">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={playerCount === count ? 'is-selected' : ''}
                    aria-pressed={playerCount === count}
                    onClick={() => setPlayerCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            <div className="ht-name-grid">
              {nameDrafts.slice(0, playerCount).map((name, index) => (
                <label key={index} className="ht-name-field">
                  <span style={{ '--player-color': PLAYER_COLORS[index] }}>Player {index + 1}</span>
                  <input
                    value={name}
                    maxLength={18}
                    onChange={(event) => setNameDrafts((currentNames) => (
                      currentNames.map((currentName, nameIndex) => (
                        nameIndex === index ? event.target.value : currentName
                      ))
                    ))}
                    aria-label={`Player ${index + 1} name`}
                  />
                </label>
              ))}
            </div>
          </div>
          <button type="button" className="ht-primary-button" onClick={startRound}>
            Start the round <span aria-hidden="true">→</span>
          </button>
        </section>
      ) : (
        <section className="ht-game" aria-label="Hidden Treasure game">
          <header className="ht-game-heading">
            <div>
              <div className="ht-kicker">Shape hunt · first to 3</div>
              <h1>Hidden Treasure</h1>
            </div>
            <div className="ht-turn-banner" aria-live="polite">
              {winnerIndex !== -1 ? 'Round complete' : `${players[activePlayer]}'s turn`}
            </div>
          </header>

          <div
            className="ht-scoreboard"
            aria-label="Player scores"
            style={{ '--player-count': players.length }}
          >
            {players.map((player, index) => (
              <div
                className={`ht-player-score${activePlayer === index && winnerIndex === -1 ? ' is-active' : ''}`}
                key={`${player}-${index}`}
                style={{ '--player-color': PLAYER_COLORS[index] }}
                aria-current={activePlayer === index && winnerIndex === -1 ? 'step' : undefined}
              >
                <span className="ht-player-avatar" aria-hidden="true">{player.charAt(0).toUpperCase()}</span>
                <span className="ht-score-name">{player}</span>
                <span className="ht-score-points">{scores[index]}</span>
                <span className="ht-score-target">/ 3</span>
              </div>
            ))}
          </div>

          <div className="ht-play-area">
            <div className="ht-board-panel ht-panel">
              <div className="ht-section-title">
                <span>Choose a number</span>
                <span className="ht-remaining">
                  {tiles.filter((tile) => !tile.revealed).length} treasures left
                </span>
              </div>
              <div className="ht-tile-grid">
                {tiles.map((tile) => (
                  <button
                    type="button"
                    className={`ht-tile${tile.revealed ? ' is-revealed' : ''}`}
                    key={tile.id}
                    onClick={() => revealTile(tile)}
                    disabled={selectedShape === null || Boolean(feedback) || winnerIndex !== -1 || tile.revealed}
                    aria-label={tile.revealed
                      ? `Number ${tile.number}, ${TREASURE_SHAPES.find(({ id }) => id === tile.shapeId)?.name}`
                      : `Reveal number ${tile.number}`}
                  >
                    {tile.revealed ? (
                      <ShapeIcon shapeId={tile.shapeId} className="ht-tile-shape" />
                    ) : (
                      <span>{tile.number}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="ht-guess-area">
                <div className="ht-section-title">
                  <span>What shape is hidden?</span>
                  <span className="ht-guess-hint">{selectedShape ? 'Now pick a number' : 'Choose your guess first'}</span>
                </div>
                <div className="ht-shape-choices">
                  {TREASURE_SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      className={`ht-shape-choice${selectedShape === shape.id ? ' is-selected' : ''}`}
                      onClick={() => setSelectedShape(shape.id)}
                      disabled={Boolean(feedback) || winnerIndex !== -1}
                      aria-pressed={selectedShape === shape.id}
                      aria-label={`Guess ${shape.name}`}
                    >
                      <ShapeIcon shapeId={shape.id} className="ht-choice-shape" />
                      <span>{shape.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="ht-feedback" aria-live="polite">
                {feedback && (
                  feedback.correct
                    ? `Correct, ${feedback.playerName}! Number ${feedback.tileNumber} hid a ${feedback.shapeName}.`
                    : `Not this time, ${feedback.playerName}. Number ${feedback.tileNumber} hid a ${feedback.shapeName}.`
                )}
              </p>
            </div>
          </div>

          {winnerIndex !== -1 && (
            <div className="ht-winner-backdrop">
              <section className="ht-winner-card ht-panel" role="dialog" aria-modal="true" aria-labelledby="ht-winner-title">
                <div className="ht-winner-treasure" aria-hidden="true">✦</div>
                <div className="ht-kicker">Treasure found!</div>
                <h2 id="ht-winner-title">{players[winnerIndex]} wins the round!</h2>
                <p>Three correct shape guesses unlock the treasure.</p>
                <div className="ht-winner-actions">
                  <button type="button" className="ht-primary-button" onClick={startRound}>Play another round</button>
                  <button type="button" className="ht-secondary-button" onClick={finishRound}>Finish round</button>
                  <button type="button" className="ht-text-button" onClick={() => setScreen('welcome')}>Change players</button>
                </div>
              </section>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
