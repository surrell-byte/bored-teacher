import { useEffect, useMemo, useState } from 'react';
import './alphabetHunt.css';

const AVATARS = ['🚗', '🐱', '⭐', '🚀', '🐸', '🍩', '🎈', '🦖', '⚽', '🌵', '🐳', '🎧', '🍕', '🦋', '🐧', '🍄', '🎩', '🐝', '🌙', '🎲', '🦉', '🍉', '🐢', '🎯', '🐙', '🍦'];
const CELEBRATION_PIECES = ['🎉', '⭐', '✨', '🎊', '🏆', '🎈'];

export default function AlphabetHunt({ onComplete }) {
  const [screen, setScreen] = useState('welcome');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [av1, setAv1] = useState(null);
  const [av2, setAv2] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [current, setCurrent] = useState(1);
  const [lock, setLock] = useState(false);
  const [found1, setFound1] = useState(0);
  const [found2, setFound2] = useState(0);
  const [misses1, setMisses1] = useState(0);
  const [misses2, setMisses2] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);
  const [statusLine, setStatusLine] = useState('');
  const [showRoundOverlay, setShowRoundOverlay] = useState(false);
  const [roundMessage, setRoundMessage] = useState('Get ready!');
  const [confetti, setConfetti] = useState([]);

  const chooseAvatar = (playerNum, avatar) => {
    const other = playerNum === 1 ? av2 : av1;
    if (avatar === other) return;
    if (playerNum === 1) setAv1(avatar);
    else setAv2(avatar);
  };

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const startGame = () => {
    const letters = [];
    for (let i = 0; i < 26; i++) letters.push(String.fromCharCode(65 + i));

    const contents = [];
    for (let a = 0; a < 5; a++) contents.push('p1');
    for (let b = 0; b < 5; b++) contents.push('p2');
    for (let c = 0; c < 16; c++) contents.push(null);
    shuffle(contents);

    const newTiles = letters.map((letter, idx) => ({
      letter,
      content: contents[idx],
      flipped: false,
      matched: false,
    }));

    setTiles(newTiles);
    setCurrent(1);
    setLock(false);
    setFound1(0);
    setFound2(0);
    setMisses1(0);
    setMisses2(0);
    setTurnNumber(1);
    setStatusLine('');
    setScreen('game');

    setTimeout(() => {
      setRoundMessage(`${name1} starts!`);
      setShowRoundOverlay(true);
      setLock(true);

      setTimeout(() => {
        setRoundMessage('Find your avatar!');
      }, 700);

      setTimeout(() => {
        setShowRoundOverlay(false);
        setStatusLine(`${name1}'s turn!`);
        setLock(false);
        setTimeout(() => setStatusLine(''), 900);
      }, 1400);
    }, 150);
  };

  const handleBegin = () => {
    if (!name1.trim() || !name2.trim()) return;
    if (!av1 || !av2) return;
    if (av1 === av2) return;
    startGame();
  };

  const handleTileClick = (idx) => {
    if (lock || !tiles[idx] || tiles[idx].flipped || tiles[idx].matched) return;

    const newTiles = [...tiles];
    const tile = newTiles[idx];
    tile.flipped = true;
    setTiles(newTiles);

    const mine = (current === 1 && tile.content === 'p1') || (current === 2 && tile.content === 'p2');

    if (mine) {
      tile.matched = true;
      const newFound1 = current === 1 ? found1 + 1 : found1;
      const newFound2 = current === 2 ? found2 + 1 : found2;
      setFound1(newFound1);
      setFound2(newFound2);
      setTiles(newTiles);

      const name = current === 1 ? name1 : name2;
      setStatusLine(`${name} found a match — go again!`);

      if ((current === 1 && newFound1 >= 5) || (current === 2 && newFound2 >= 5)) {
        const avatar = current === 1 ? av1 : av2;
        setTimeout(() => showWin(name, avatar), 500);
        return;
      }
    } else {
      setLock(true);
      const newMisses1 = current === 1 ? misses1 + 1 : misses1;
      const newMisses2 = current === 2 ? misses2 + 1 : misses2;
      setMisses1(newMisses1);
      setMisses2(newMisses2);

      const wasOpponentAvatar = tile.content !== null;
      const name = current === 1 ? name1 : name2;
      const opponentName = current === 1 ? name2 : name1;
      const opponentAv = current === 1 ? av2 : av1;

      if (wasOpponentAvatar) {
        setStatusLine(`${name} found ${opponentAv} — that's ${opponentName}'s tile!`);
      } else {
        setStatusLine(`${name} found an empty tile.`);
      }

      setTimeout(() => {
        tile.flipped = false;
        const newTiles2 = [...newTiles];
        newTiles2[idx] = tile;
        setTiles(newTiles2);

        const nextCurrent = current === 1 ? 2 : 1;
        setCurrent(nextCurrent);
        setTurnNumber(turnNumber + 1);

        const nextName = nextCurrent === 1 ? name1 : name2;
        setStatusLine(`${nextName}'s turn!`);

        setTimeout(() => {
          setStatusLine('');
          setLock(false);
        }, 650);
      }, 1000);
    }
  };

  const showWin = (name, avatar) => {
    const misses = current === 1 ? misses1 : misses2;
    const accuracy = Math.round((5 / Math.max(turnNumber, 1)) * 100);

    // Trigger confetti
    const pieces = [];
    for (let i = 0; i < 35; i++) {
      pieces.push({
        id: `${i}-${Date.now()}`,
        emoji: CELEBRATION_PIECES[Math.floor(Math.random() * CELEBRATION_PIECES.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        size: 0.8 + Math.random() * 1.2,
      });
    }
    setConfetti(pieces);

    setTimeout(() => {
      setConfetti([]);
      setScreen('win');
      // Call onComplete with accuracy score
      onComplete?.(accuracy, accuracy);
    }, 500);
  };

  const handleRestart = () => {
    if (lock) return;
    if (confirm('Restart this game?')) {
      setName1('');
      setName2('');
      setAv1(null);
      setAv2(null);
      setStatusLine('');
      startGame();
    }
  };

  const handlePlayAgain = () => {
    setName1('');
    setName2('');
    setAv1(null);
    setAv2(null);
    setStatusLine('');
    setConfetti([]);
    setScreen('welcome');
  };

  // Welcome screen
  if (screen === 'welcome') {
    return (
      <div className="alphabet-hunt ah-screen ah-welcome-screen">
        <div className="ah-card">
          <h1>Alphabet Hunt</h1>
          <p className="ah-tag">A two-player memory game, 26 tiles wide</p>
          <p className="ah-rules">
            Twenty-six tiles cover the alphabet, A to Z. Underneath, five tiles hide
            <b> Player One's</b> avatar and five hide <b>Player Two's</b> avatar &mdash;
            the rest are empty. Take turns flipping one tile at a time. Find your own
            avatar and you flip again; find an empty tile or your opponent's avatar and
            the turn passes. <b className="two">Whoever uncovers all five of their own avatar first wins.</b>
          </p>
          <button className="ah-btn" onClick={() => setScreen('setup')}>Set up players</button>
        </div>
      </div>
    );
  }

  // Setup screen
  if (screen === 'setup') {
    const errorMsg = !name1.trim() || !name2.trim()
      ? 'Both players need a name.'
      : !av1 || !av2
        ? 'Both players need to pick an avatar.'
        : av1 === av2
          ? 'Players need different avatars.'
          : '';

    return (
      <div className="alphabet-hunt ah-screen ah-setup-screen">
        <div className="ah-card">
          <h1 style={{ fontSize: '2rem' }}>Who's playing?</h1>
          <p className="ah-tag">Enter a name and pick an avatar for each player</p>

          <div className="ah-setup-players">
            <div className="ah-player-block ah-p1">
              <h2>Player One</h2>
              <input
                type="text"
                maxLength={16}
                placeholder="Enter name"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
              />
              <div className="ah-avatar-grid">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    className={`ah-avatar-choice ${av1 === a ? 'selected p1sel' : ''} ${av2 === a ? 'taken' : ''}`}
                    onClick={() => chooseAvatar(1, a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="ah-player-block ah-p2">
              <h2>Player Two</h2>
              <input
                type="text"
                maxLength={16}
                placeholder="Enter name"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
              />
              <div className="ah-avatar-grid">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    className={`ah-avatar-choice ${av2 === a ? 'selected p2sel' : ''} ${av1 === a ? 'taken' : ''}`}
                    onClick={() => chooseAvatar(2, a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ah-setup-error">{errorMsg}</div>
          <div className="ah-setup-actions">
            <button className="ah-btn ah-secondary" onClick={() => setScreen('welcome')}>Back</button>
            <button className="ah-btn" onClick={handleBegin} disabled={!!errorMsg}>Start game</button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  if (screen === 'game') {
    const data = {
      found1,
      found2,
      misses1,
      misses2,
      turnNumber,
      current,
      statusLine,
      av1,
      av2,
      name1,
      name2,
      tiles,
    };

    return (
      <div className="alphabet-hunt ah-screen ah-game-screen">
        <div className="ah-card">
          {showRoundOverlay && (
            <div className="ah-round-overlay show">
              <div className="ah-round-message">{roundMessage}</div>
            </div>
          )}

          <div className="ah-hud">
            <div className={`ah-hud-player ah-p1 ${current === 1 ? 'active' : ''}`}>
              <div className="ah-hud-name">
                <span>{av1}</span>
                <span>{name1}</span>
              </div>
              <div className="ah-hud-turn">{current === 1 ? 'Your turn' : ''}</div>
              <div className="ah-hud-found">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`ah-hud-slot ${i < found1 ? 'filled' : ''}`}>
                    {i < found1 ? av1 : ''}
                  </div>
                ))}
              </div>
            </div>

            <div className={`ah-hud-player ah-p2 ${current === 2 ? 'active' : ''}`}>
              <div className="ah-hud-name">
                <span>{av2}</span>
                <span>{name2}</span>
              </div>
              <div className="ah-hud-turn">{current === 2 ? 'Your turn' : ''}</div>
              <div className="ah-hud-found">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`ah-hud-slot ${i < found2 ? 'filled' : ''}`}>
                    {i < found2 ? av2 : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ah-grid">
            {tiles.map((tile, idx) => (
              <button
                key={idx}
                className={`ah-tile ${tile.flipped ? 'flipped' : ''} ${tile.matched ? 'matched' : ''}`}
                onClick={() => handleTileClick(idx)}
                disabled={lock || tile.matched}
              >
                <div className="ah-tile-inner">
                  <div className="ah-tile-face ah-tile-front">{tile.letter}</div>
                  <div className="ah-tile-face ah-tile-back">
                    {tile.content === 'p1' ? av1 : tile.content === 'p2' ? av2 : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="ah-status-line">{statusLine}</div>

          <div className="ah-game-stats">
            <div>
              <span className="ah-stat-label">TURN</span>
              <strong>{turnNumber}</strong>
            </div>
            <div>
              <span className="ah-stat-label">P1 MISSES</span>
              <strong>{misses1}</strong>
            </div>
            <div>
              <span className="ah-stat-label">P2 MISSES</span>
              <strong>{misses2}</strong>
            </div>
            <button className="ah-mini-btn" onClick={handleRestart}>↻ Restart</button>
          </div>
        </div>

        <div className="ah-celebration">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="ah-confetti"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                fontSize: `${piece.size}rem`,
              }}
            >
              {piece.emoji}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Win screen
  if (screen === 'win') {
    const misses = current === 1 ? misses1 : misses2;
    const accuracy = Math.round((5 / Math.max(turnNumber, 1)) * 100);
    const avatar = current === 1 ? av1 : av2;
    const name = current === 1 ? name1 : name2;

    return (
      <div className="alphabet-hunt ah-screen ah-win-screen">
        <div className="ah-card ah-win-card">
          <div className="ah-win-avatar">{avatar}</div>
          <h1 className="ah-win-title">{name} wins!</h1>
          <p className="ah-tag">Found all five {avatar} tiles first.</p>

          <div className="ah-win-stats">
            <div>
              <strong>{turnNumber}</strong>
              <span>Turns</span>
            </div>
            <div>
              <strong>{misses}</strong>
              <span>Misses</span>
            </div>
            <div>
              <strong>{accuracy}%</strong>
              <span>Accuracy</span>
            </div>
          </div>

          <button className="ah-btn" onClick={handlePlayAgain}>Play again</button>
        </div>
      </div>
    );
  }

  return null;
}
