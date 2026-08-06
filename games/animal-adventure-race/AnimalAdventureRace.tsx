'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  onComplete: (score: number, accuracy: number) => void;
}

interface Player {
  avatar: string;
  position: number;
  points: number;
}

interface Effect {
  text: string;
  move: number;
  points: number;
  rarity: string;
  weight: number;
}

interface TileMessage {
  text: string;
  points: number;
  move: number;
}

const BOARD_COLS = 5;
const BOARD_ROWS = 6;
const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;

const specialTiles: Record<number, string> = {
  4: 'bonus',
  8: 'trap',
  13: 'treasure',
  17: 'trap',
  21: 'boost',
  26: 'bonus',
};

const tileIcons: Record<string, string> = {
  bonus: '⭐',
  trap: '🐌',
  treasure: '🎁',
  boost: '🚀',
};

const tileMessages: Record<string, TileMessage> = {
  bonus: { text: 'Bonus tile! +15 points', points: 15, move: 0 },
  trap: { text: 'Slowed down! Move back 2', points: 0, move: -2 },
  treasure: { text: 'Treasure found! +30 points', points: 30, move: 0 },
  boost: { text: 'Boost tile! Move forward 3', points: 0, move: 3 },
};

const AVATARS = [
  { emoji: '🐸', label: 'Frog' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐼', label: 'Panda' },
  { emoji: '🐵', label: 'Monkey' },
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🐯', label: 'Tiger' },
  { emoji: '🐧', label: 'Penguin' },
  { emoji: '🐰', label: 'Rabbit' },
  { emoji: '🐨', label: 'Koala' },
  { emoji: '🐻', label: 'Bear' },
  { emoji: '🦄', label: 'Unicorn' },
  { emoji: '🐘', label: 'Elephant' },
];

const COLOURS = ['red', 'yellow', 'green', 'blue'] as const;
const colourEmoji: Record<string, string> = { red: '🔴', yellow: '🟡', green: '🟢', blue: '🔵' };

const effectPool: Effect[] = [
  { text: 'Move forward 2', move: 2, points: 0, rarity: 'common', weight: 4 },
  { text: 'Move forward 3', move: 3, points: 5, rarity: 'common', weight: 3 },
  { text: 'Move back 2', move: -2, points: 0, rarity: 'common', weight: 3 },
  { text: 'Stay where you are', move: 0, points: 0, rarity: 'common', weight: 2 },
  { text: 'Bonus +25 points', move: 0, points: 25, rarity: 'uncommon', weight: 2 },
  { text: 'Move forward 5', move: 5, points: 20, rarity: 'rare', weight: 1 },
  { text: 'Jackpot! +50 points', move: 0, points: 50, rarity: 'rare', weight: 1 },
];

function snakePosition(row: number, col: number): number {
  if (row % 2 === 0) {
    return row * BOARD_COLS + col;
  }
  return row * BOARD_COLS + (BOARD_COLS - 1 - col);
}

function pickWeightedEffect(pool: Effect[]): Effect {
  const totalWeight = pool.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const effect of pool) {
    roll -= effect.weight;
    if (roll <= 0) return effect;
  }
  return pool[pool.length - 1];
}

export default function AnimalAdventureRace({ onComplete }: Props) {
  const [screen, setScreen] = useState<'welcome' | 'howTo' | 'mode' | 'avatar' | 'game' | 'win'>('welcome');
  const [numPlayers, setNumPlayers] = useState(1);
  const [chosenAvatars, setChosenAvatars] = useState<string[]>([]);
  const [pickingPlayerIndex, setPickingPlayerIndex] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [shuffledEffects, setShuffledEffects] = useState<Record<string, Effect>>({});
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('Pick one of the four cards.');
  const [effectText, setEffectText] = useState('Waiting...');
  const [winTitle, setWinTitle] = useState('');
  const [winnerAvatar, setWinnerAvatar] = useState('');
  const [flipColour, setFlipColour] = useState('');
  const [flipEffect, setFlipEffect] = useState<Effect | null>(null);
  const [showFlip, setShowFlip] = useState(false);
  const [practicePos, setPracticePos] = useState(0);
  const [practicePlaying, setPracticePlaying] = useState(false);
  const [practiceMessage, setPracticeMessage] = useState('Tap a card to practice!');
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const gameStateRef = useRef<{
    players: Player[];
    currentPlayerIndex: number;
    playing: boolean;
    numPlayers: number;
  }>({ players: [], currentPlayerIndex: 0, playing: false, numPlayers: 1 });

  useEffect(() => {
    gameStateRef.current.players = players;
  }, [players]);
  useEffect(() => {
    gameStateRef.current.currentPlayerIndex = currentPlayerIndex;
  }, [currentPlayerIndex]);
  useEffect(() => {
    gameStateRef.current.playing = playing;
  }, [playing]);
  useEffect(() => {
    gameStateRef.current.numPlayers = numPlayers;
  }, [numPlayers]);

  const positions = Array.from({ length: BOARD_SIZE }, (_, i) => i);

  const shuffleEffects = useCallback(() => {
    const effects: Record<string, Effect> = {};
    COLOURS.forEach(colour => {
      effects[colour] = pickWeightedEffect(effectPool);
    });
    setShuffledEffects(effects);
  }, []);

  const enableCards = useCallback(() => {
    cardsRef.current.forEach(card => {
      if (card) card.disabled = false;
    });
  }, []);

  const disableCards = useCallback(() => {
    cardsRef.current.forEach(card => {
      if (card) card.disabled = true;
    });
  }, []);

  const animateMove = useCallback((steps: number, onComplete?: () => void) => {
    setPlaying(false);
    const direction = steps > 0 ? 1 : -1;
    const totalSteps = Math.abs(steps);
    let stepCount = 0;

    function moveOneStep() {
      if (stepCount >= totalSteps) {
        setPlaying(true);
        if (onComplete) onComplete();
        return;
      }

      setPlayers(prev => {
        const updated = [...prev];
        const current = updated[gameStateRef.current.currentPlayerIndex];
        let nextPosition = current.position + direction;

        if (nextPosition > BOARD_SIZE - 1) {
          nextPosition = current.position - 1;
        }
        if (nextPosition < 0) {
          nextPosition = 0;
        }

        updated[gameStateRef.current.currentPlayerIndex] = { ...current, position: nextPosition };
        return updated;
      });

      stepCount++;
      setTimeout(moveOneStep, 300);
    }

    moveOneStep();
  }, []);

  const checkTile = useCallback((callback: () => void) => {
    setPlayers(prev => {
      const current = prev[gameStateRef.current.currentPlayerIndex];
      const tileNumber = current.position + 1;
      const specialType = specialTiles[tileNumber];
      if (!specialType) {
        callback();
        return prev;
      }
      const tileEffect = tileMessages[specialType];
      setMessage(tileEffect.text);
      const updated = [...prev];
      updated[gameStateRef.current.currentPlayerIndex] = {
        ...current,
        points: current.points + tileEffect.points,
      };
      if (tileEffect.move !== 0) {
        setTimeout(() => {
          animateMove(tileEffect.move, callback);
        }, 500);
      } else {
        setTimeout(callback, 700);
      }
      return updated;
    });
  }, [animateMove]);

  const endTurn = useCallback(() => {
    checkTile(() => {
      setPlayers(prev => {
        const current = prev[gameStateRef.current.currentPlayerIndex];
        if (current.position >= BOARD_SIZE - 1) {
          setPlaying(false);
          const title = gameStateRef.current.numPlayers === 2
            ? `Player ${gameStateRef.current.currentPlayerIndex + 1} Wins!`
            : 'You Win!';
          setWinTitle(title);
          setWinnerAvatar(current.avatar);
          setScreen('win');
          launchConfetti();
          onComplete(current.points, Math.round((current.position / (BOARD_SIZE - 1)) * 100));
          return prev;
        }
        const nextIndex = (gameStateRef.current.currentPlayerIndex + 1) % prev.length;
        setCurrentPlayerIndex(nextIndex);
        shuffleEffects();
        enableCards();
        setMessage(gameStateRef.current.numPlayers === 2
          ? `Player ${nextIndex + 1}, choose a coloured card.`
          : 'Choose another coloured card.');
        return prev;
      });
    });
  }, [checkTile, shuffleEffects, enableCards, onComplete]);

  const applyEffect = useCallback((effect: Effect, colour: string) => {
    setPlayers(prev => {
      const updated = [...prev];
      const current = updated[gameStateRef.current.currentPlayerIndex];
      current.points += effect.points;
      setMessage(`${colourEmoji[colour] || ''} ${colour.toUpperCase()} card revealed!`);
      if (effect.move === 0) {
        setTimeout(() => endTurn(), 800);
        return updated;
      }
      animateMove(effect.move);
      return updated;
    });
  }, [endTurn, animateMove]);

  const playFlipAnimation = useCallback((colour: string, effect: Effect, onDone: () => void) => {
    setFlipColour(colour);
    setFlipEffect(effect);
    setShowFlip(true);
    setTimeout(() => {
      setShowFlip(false);
      onDone();
    }, 1400);
  }, []);

  const handleCardClick = useCallback((colour: string) => {
    if (!playing) return;
    disableCards();
    const effect = shuffledEffects[colour];
    if (!effect) return;
    playFlipAnimation(colour, effect, () => {
      setMessage(`${colour.toUpperCase()} card revealed!`);
      applyEffect(effect, colour);
    });
  }, [playing, shuffledEffects, disableCards, playFlipAnimation, applyEffect]);

  const resetGame = useCallback(() => {
    setPlayers(chosenAvatars.map(avatar => ({ avatar, position: 0, points: 0 })));
    setCurrentPlayerIndex(0);
    setPlaying(true);
    setEffectText('Waiting...');
    setMessage('Pick one of the four cards.');
    shuffleEffects();
    enableCards();
  }, [chosenAvatars, shuffleEffects, enableCards]);

  const startAvatarPicking = useCallback(() => {
    setPickingPlayerIndex(0);
    setChosenAvatars([]);
    setScreen('avatar');
  }, []);

  const beginMainGame = useCallback(() => {
    setPlayers(chosenAvatars.map(avatar => ({ avatar, position: 0, points: 0 })));
    setCurrentPlayerIndex(0);
    setScreen('game');
    resetGame();
  }, [chosenAvatars, resetGame]);

  // Confetti on win
  useEffect(() => {
    if (screen === 'win') {
      launchConfetti();
    }
  }, [screen]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!playing) return;
      if (screen !== 'game') return;
      switch (e.key) {
        case '1': handleCardClick('red'); break;
        case '2': handleCardClick('yellow'); break;
        case '3': handleCardClick('green'); break;
        case '4': handleCardClick('blue'); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playing, screen, handleCardClick]);

  const practiceMoves: Record<string, number> = { red: 1, yellow: 2, green: -1, blue: 3 };
  const PRACTICE_SIZE = 8;

  return (
    <div style={styles.game}>
      <header style={styles.header}>
        <div style={styles.title}>🐾 Animal Adventure Race</div>
        <div style={styles.scorebar}>
          <div style={{ ...styles.scoreChip, ...(currentPlayerIndex === 0 ? styles.scoreChipTurn : {}) }}>
            <div style={styles.tokenMini}>{players[0]?.avatar || '🐸'}</div>
            <div style={styles.statLine}>
              <b>{players[0]?.points ?? 0} pts</b>
              <span>{players[0] ? `${players[0].position + 1} / ${BOARD_SIZE}` : '1 / 30'}</span>
            </div>
          </div>
          <div style={styles.turnPill}>
            {numPlayers === 2 ? `PLAYER ${currentPlayerIndex + 1}'S TURN` : "YOUR TURN"}
          </div>
          {numPlayers === 2 && (
            <div style={{ ...styles.scoreChip, ...(currentPlayerIndex === 1 ? styles.scoreChipTurn : {}) }}>
              <div style={styles.tokenMini}>{players[1]?.avatar || '🦊'}</div>
              <div style={styles.statLine}>
                <b>{players[1]?.points ?? 0} pts</b>
                <span>{players[1] ? `${players[1].position + 1} / ${BOARD_SIZE}` : '1 / 30'}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {screen === 'welcome' && (
        <section style={{ ...styles.screen, ...styles.welcomeScreen }}>
          <div style={styles.skyLayer}>
            <div style={{ ...styles.cloud, ...styles.cloud1 }}>☁️</div>
            <div style={{ ...styles.cloud, ...styles.cloud2 }}>☁️</div>
            <div style={{ ...styles.cloud, ...styles.cloud3 }}>☁️</div>
            <div style={styles.treeRow}>
              <span>🌴</span><span>🌳</span><span>🌴</span><span>🌳</span><span>🌴</span><span>🌳</span><span>🌴</span>
            </div>
          </div>
          <div style={styles.welcomeContent}>
            <div style={styles.hero}>🐵 🦁 🐼</div>
            <h2 style={styles.welcomeTitle}>Animal Adventure Race</h2>
            <p style={styles.sub}>
              Race your animal friend across the board by flipping colour cards.
              Land on special tiles for treasure, boosts, and traps. Play solo or
              take turns with a friend!
            </p>
            <div style={styles.btnRow}>
              <button style={{ ...styles.bigBtn, ...styles.primary }} onClick={() => setScreen('mode')}>▶ Start Game</button>
              <button style={{ ...styles.bigBtn, ...styles.secondary }} onClick={() => { setScreen('howTo'); }}>❓ How to Play</button>
            </div>
          </div>
        </section>
      )}

      {screen === 'howTo' && (
        <section style={styles.screen}>
          <h2 style={styles.screenTitle}>How to Play</h2>
          <ol style={styles.howToList}>
            <li>Choose your animal avatar to begin (each player picks their own).</li>
            <li>On your turn, tap one of the four coloured cards.</li>
            <li>Watch the card flip over to reveal your move and points!</li>
            <li>Special tiles can help or hinder you: ⭐ bonus, 🎁 treasure, 🚀 boost, 🐌 trap.</li>
            <li>First animal to reach the finish tile wins!</li>
          </ol>
          <p style={styles.sub}>Try a quick practice round below on a mini board before the real race.</p>

          <div style={styles.practiceWrap}>
            <div style={styles.practiceBoard}>
              {Array.from({ length: PRACTICE_SIZE }, (_, i) => {
                const isStart = i === 0;
                const isFinish = i === PRACTICE_SIZE - 1;
                const isActive = i === practicePos;
                let tileStyle: React.CSSProperties = styles.space;
                if (isStart) tileStyle = { ...tileStyle, ...styles.spaceStart };
                if (isFinish) tileStyle = { ...tileStyle, ...styles.spaceFinish };
                if (isActive) tileStyle = { ...tileStyle, ...styles.spaceActive };
                return (
                  <div key={i} style={tileStyle}>
                    {isActive && <span style={styles.practiceToken}>🐸</span>}
                    {isStart && <span style={styles.tileIcon}>🏁</span>}
                    {isFinish && <span style={styles.tileIcon}>🏁</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ ...styles.sub, marginBottom: 14 }}>{practiceMessage}</div>
            <div style={{ ...styles.cards, gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {COLOURS.map(colour => (
                <button
                  key={colour}
                  style={{ ...styles.card, ...styles[colour as keyof typeof styles] }}
                  onClick={() => {
                    if (!practicePlaying) return;
                    const move = practiceMoves[colour] ?? 1;
                    setPracticeMessage(`${colour.toUpperCase()} card: move ${move > 0 ? 'forward ' + move : 'back ' + Math.abs(move)}`);
                    let next = practicePos + move;
                    if (next > PRACTICE_SIZE - 1) next = PRACTICE_SIZE - 1;
                    if (next < 0) next = 0;
                    setPracticePos(next);
                    if (next >= PRACTICE_SIZE - 1) {
                      setPracticePlaying(false);
                      setPracticeMessage('🎉 You reached the finish! That\'s the idea — try the real race now.');
                    }
                  }}
                >
                  <span style={styles.cardIcon}>{colourEmoji[colour]}</span>
                  {colour.charAt(0).toUpperCase() + colour.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.practiceFooter}>
            <button style={{ ...styles.bigBtn, ...styles.ghost }} onClick={() => setScreen('mode')}>Skip, I know how to play →</button>
          </div>
        </section>
      )}

      {screen === 'mode' && (
        <section style={styles.screen}>
          <h2 style={styles.screenTitle}>Who's Playing?</h2>
          <p style={styles.sub}>Choose how many animals are racing today.</p>
          <div style={styles.btnRow}>
            <button style={{ ...styles.bigBtn, ...styles.primary }} onClick={() => { setNumPlayers(1); startAvatarPicking(); }}>🙋 1 Player</button>
            <button style={{ ...styles.bigBtn, ...styles.secondary }} onClick={() => { setNumPlayers(2); startAvatarPicking(); }}>🙋‍♀️🙋‍♂️ 2 Players</button>
          </div>
        </section>
      )}

      {screen === 'avatar' && (
        <section style={styles.screen}>
          <h2 style={styles.screenTitle}>Choose Your Animal</h2>
          <div style={styles.pickingFor}>{pickingPlayerIndex === 0 ? 'Player 1, pick your animal' : `Player ${pickingPlayerIndex + 1}, pick your animal`}</div>
          <div style={styles.avatars}>
            {AVATARS.map(av => {
              const selected = chosenAvatars.includes(av.emoji);
              const alreadyChosen = chosenAvatars.includes(av.emoji);
              return (
                <button
                  key={av.emoji}
                  style={{
                    ...styles.avatar,
                    ...(selected ? styles.avatarSelected : {}),
                    ...(alreadyChosen && !selected ? styles.avatarDisabled : {}),
                  }}
                  onClick={() => {
                    if (alreadyChosen && !selected) return;
                    const newAvatars = selected ? chosenAvatars : [...chosenAvatars, av.emoji];
                    setChosenAvatars(newAvatars);
                    const nextIndex = pickingPlayerIndex + 1;
                    setPickingPlayerIndex(nextIndex);
                    if (nextIndex < numPlayers) {
                      // stay on avatar screen for next player
                    } else {
                      beginMainGame();
                    }
                  }}
                  disabled={alreadyChosen && !selected}
                >
                  <span style={{ fontSize: 44 }}>{av.emoji}</span>
                  <span style={styles.avatarLabel}>{av.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {screen === 'game' && (
        <div style={styles.gameArea}>
          <div style={styles.boardWrap}>
            <div style={styles.progressWrap}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, ...styles.progressP1, width: `${(players[0]?.position ?? 0) / (BOARD_SIZE - 1) * 100}%` }} />
              </div>
              {numPlayers === 2 && (
                <div style={{ ...styles.progressBar, marginTop: 6 }}>
                  <div style={{ ...styles.progressFill, ...styles.progressP2, width: `${(players[1]?.position ?? 0) / (BOARD_SIZE - 1) * 100}%` }} />
                </div>
              )}
            </div>
            <div style={styles.board}>
              {positions.map(pos => {
                const row = Math.floor(pos / BOARD_COLS);
                const col = pos % BOARD_COLS;
                const actualPos = snakePosition(row, col);
                const specialType = specialTiles[actualPos + 1];
                const isActive = players.some(p => p.position === actualPos);
                let tileStyle: React.CSSProperties = styles.space;
                if (actualPos === 0) tileStyle = { ...tileStyle, ...styles.spaceStart };
                if (actualPos === BOARD_SIZE - 1) tileStyle = { ...tileStyle, ...styles.spaceFinish };
                if (specialType) {
                  const specialStyle = (styles as any)[`space${specialType.charAt(0).toUpperCase() + specialType.slice(1)}`];
                  if (specialStyle) tileStyle = { ...tileStyle, ...specialStyle };
                }
                if (isActive) tileStyle = { ...tileStyle, ...styles.spaceActive };

                return (
                  <div key={pos} style={tileStyle}>
                    {specialType && <div style={styles.tileIcon}>{tileIcons[specialType]}</div>}
                    <div style={styles.number}>{actualPos + 1}</div>
                    <div style={styles.tokenStack}>
                      {players.map((p, idx) => (
                        p.position === actualPos && (
                          <div
                            key={idx}
                            style={{
                              ...styles.token,
                              ...(idx === 1 ? styles.tokenP2 : {}),
                            }}
                          >
                            {p.avatar}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside style={styles.sidebar}>
            <div style={styles.currentPlayer}>
              <div style={styles.bigToken}>{players[currentPlayerIndex]?.avatar || '🐸'}</div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{numPlayers === 2 ? `Player ${currentPlayerIndex + 1}'s Turn` : "Your Turn"}</h3>
            </div>

            <div style={styles.message}>{message}</div>

            <div style={styles.cards}>
              {COLOURS.map(colour => (
                <button
                  key={colour}
                  ref={el => { cardsRef.current[COLOURS.indexOf(colour)] = el; }}
                  style={{ ...styles.card, ...styles[colour as keyof typeof styles] }}
                  onClick={() => handleCardClick(colour)}
                  disabled={!playing}
                >
                  <span style={styles.cardIcon}>{colourEmoji[colour]}</span>
                  {colour.charAt(0).toUpperCase() + colour.slice(1)}
                </button>
              ))}
            </div>

            <div style={styles.effectBox}>{effectText}</div>

            <button style={styles.restart} onClick={() => { setScreen('welcome'); resetGame(); }}>Restart Game</button>
          </aside>
        </div>
      )}

      {screen === 'win' && (
        <div style={styles.winScreen}>
          <div style={styles.winBox}>
            <div style={styles.trophy}>🏆</div>
            <h1 style={styles.winTitle}>{winTitle}</h1>
            <div style={styles.winnerAvatar}>{winnerAvatar}</div>
            <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
            <p>Congratulations!</p>
            <button style={styles.playAgain} onClick={() => { setScreen('welcome'); resetGame(); }}>Play Again</button>
          </div>
        </div>
      )}

      {showFlip && flipEffect && (
        <div style={styles.flipOverlay}>
          <div style={styles.flipCard}>
            <div style={{
              ...styles.flipFace,
              ...styles.flipFront,
              background: `linear-gradient(160deg, ${flipColour === 'red' ? '#ff7a7a,#ff4444' : flipColour === 'yellow' ? '#ffe07a,#ffc21a' : flipColour === 'green' ? '#63e08e,#28b85f' : '#7aaeff,#3d78ff'})`,
            }}>
              {colourEmoji[flipColour]}
            </div>
            <div style={{ ...styles.flipFace, ...styles.flipBack }}>
              <div style={styles.flipLabel}>{flipColour} card</div>
              <div style={styles.flipEffectText}>{flipEffect.text}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { overflow-x: hidden; width: 100%; }
        @keyframes driftCloud { from { transform: translateX(0); } to { transform: translateX(160vw); } }
        @keyframes heroBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(77,141,255,.55); } 50% { box-shadow: 0 0 0 8px rgba(77,141,255,0); } }
        @keyframes tokenBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes tokenHop { 0% { transform: translateY(0) scale(1); } 45% { transform: translateY(-16px) scale(1.18); } 100% { transform: translateY(0) scale(1); } }
        @keyframes confettiFall { to { transform: translateY(110vh) rotate(600deg); opacity: .3; } }
        @keyframes flipCard { 0% { transform: rotateY(0deg) scale(.75); } 55% { transform: rotateY(180deg) scale(1.1); } 100% { transform: rotateY(180deg) scale(1); } }
        @keyframes pop { from { transform: scale(.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes hop { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

function launchConfetti() {
  const colours = ['#ff5656', '#ffca38', '#39c86d', '#4d8dff', '#ff8a4d', '#c77dff'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confettiPiece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colours[Math.floor(Math.random() * colours.length)];
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.animationDelay = (Math.random() * 0.6) + 's';
    piece.style.position = 'fixed';
    piece.style.top = '-20px';
    piece.style.width = '10px';
    piece.style.height = '16px';
    piece.style.opacity = '0.9';
    piece.style.zIndex = '200';
    piece.style.pointerEvents = 'none';
    piece.style.borderRadius = '2px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }
}

const styles: Record<string, React.CSSProperties> = {
  game: {
    maxWidth: 1400,
    margin: 'auto',
    width: '100%',
    fontFamily: "'Trebuchet MS', Arial, Helvetica, sans-serif",
    background: 'linear-gradient(135deg, #79d2ff, #d8f5ff)',
    minHeight: '100vh',
    padding: 16,
  },
  header: {
    background: 'white',
    borderRadius: 18,
    padding: '12px 22px',
    marginBottom: 16,
    boxShadow: '0 8px 20px rgba(0,0,0,.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    minHeight: 64,
    flexWrap: 'wrap' as const,
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: 800,
    whiteSpace: 'nowrap' as const,
  },
  scorebar: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  scoreChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f4f8ff',
    borderRadius: 30,
    padding: '6px 14px 6px 6px',
    border: '2px solid transparent',
    transition: '.25s',
    fontSize: '.92rem',
  },
  scoreChipTurn: {
    borderColor: '#4d8dff',
    background: '#e4efff',
    boxShadow: '0 0 0 3px rgba(77,141,255,.25)',
  },
  tokenMini: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 30%, #fff, #dfeaff 60%, #b9cdf5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 19,
    boxShadow: 'inset 0 -2px 3px rgba(0,0,0,.08), 0 2px 5px rgba(0,0,0,.15)',
  },
  statLine: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.15,
  },
  turnPill: {
    background: '#4d8dff',
    color: 'white',
    padding: '8px 18px',
    borderRadius: 30,
    fontWeight: 800,
    fontSize: '.85rem',
    letterSpacing: '.5px',
    animation: 'pulseGlow 1.6s infinite',
    whiteSpace: 'nowrap' as const,
  },
  screen: {
    background: 'white',
    borderRadius: 20,
    padding: 30,
    boxShadow: '0 10px 25px rgba(0,0,0,.15)',
    maxWidth: 900,
    margin: '0 auto',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  welcomeScreen: {
    background: 'linear-gradient(180deg, #bdeaff 0%, #d8f5ff 40%, #eafff0 100%)',
    padding: 0,
    minHeight: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skyLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
    fontSize: 46,
    opacity: .85,
    animation: 'driftCloud 30s linear infinite',
  },
  cloud1: { top: '8%', left: '-10%', animationDelay: '0s' },
  cloud2: { top: '18%', left: '-30%', fontSize: 34, animationDelay: '6s' },
  cloud3: { top: '4%', left: '-50%', fontSize: 38, animationDelay: '14s' },
  treeRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 56,
    opacity: .9,
    padding: '0 10px',
  },
  welcomeContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '50px 30px 70px',
  },
  hero: {
    fontSize: 70,
    marginBottom: 6,
    animation: 'heroBounce 2.2s ease-in-out infinite',
  },
  welcomeTitle: {
    fontSize: '2rem',
    textShadow: '0 2px 0 rgba(255,255,255,.7)',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap' as const,
    marginTop: 18,
  },
  bigBtn: {
    border: 'none',
    borderRadius: 16,
    padding: '16px 32px',
    fontSize: 18,
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    color: 'white',
    transition: '.2s',
    boxShadow: '0 6px 14px rgba(0,0,0,.15)',
  },
  primary: { background: '#4d8dff' },
  secondary: { background: '#39c86d' },
  ghost: { background: '#eef2f7', color: '#444', boxShadow: 'none' },
  screenTitle: {
    textAlign: 'center',
    marginBottom: 18,
  },
  sub: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
    lineHeight: 1.5,
  },
  howToList: {
    maxWidth: 560,
    margin: '0 auto 25px',
    lineHeight: 1.8,
  },
  practiceWrap: {
    background: '#f4f8ff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 10,
  },
  practiceBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: 8,
    marginBottom: 16,
  },
  space: {
    aspectRatio: '1',
    borderRadius: 14,
    background: '#edf4ff',
    border: '2px solid #c8dcff',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    overflow: 'visible',
  },
  spaceStart: { background: '#9dff9d' },
  spaceFinish: { background: '#ffd56a' },
  spaceActive: {
    boxShadow: '0 0 0 3px #4d8dff, 0 0 16px rgba(77,141,255,.7)',
    transform: 'scale(1.05)',
    zIndex: 2,
  },
  spaceBonus: {
    background: 'linear-gradient(135deg, #fff2b8, #ffe36b)',
    boxShadow: '0 0 12px rgba(255,214,0,.5) inset',
  },
  spaceTrap: {
    background: 'repeating-linear-gradient(45deg, #ffd0d0 0 6px, #ffb3b3 6px 12px)',
  },
  spaceTreasure: {
    background: 'radial-gradient(circle, #e2ffe2, #9dffb0)',
    boxShadow: '0 0 14px rgba(60,220,100,.55)',
  },
  spaceBoost: {
    background: 'linear-gradient(135deg, #d8e8ff, #8fc0ff)',
  },
  tileIcon: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 13,
  },
  number: {
    position: 'absolute',
    top: 3,
    left: 6,
    fontSize: 10,
    color: '#889',
  },
  practiceToken: {
    fontSize: 20,
    width: 26,
    height: 26,
    margin: 'auto',
  },
  practiceFooter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap' as const,
  },
  gameArea: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 280px',
    gap: 20,
    alignItems: 'start',
  },
  boardWrap: {
    width: '100%',
    minWidth: 0,
    background: 'white',
    borderRadius: 20,
    padding: 16,
    boxShadow: '0 10px 25px rgba(0,0,0,.15)',
  },
  progressWrap: {
    marginBottom: 14,
  },
  progressBar: {
    height: 14,
    borderRadius: 10,
    background: '#eef2f8',
    overflow: 'hidden',
    display: 'flex',
  },
  progressFill: {
    height: '100%',
    transition: 'width .3s ease',
  },
  progressP1: { background: '#4d8dff' },
  progressP2: { background: '#ff8a4d' },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 8,
    width: '100%',
    minWidth: 0,
  },
  tokenStack: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    pointerEvents: 'none',
  },
  token: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 30%, #ffffff, #dfeaff 60%, #b9cdf5)',
    boxShadow: '0 3px 6px rgba(0,0,0,.25), inset 0 -2px 3px rgba(0,0,0,.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    animation: 'tokenBounce .9s ease-in-out infinite',
    transition: 'transform .25s ease',
    border: '2px solid white',
  },
  tokenP2: {
    width: 24,
    height: 24,
    fontSize: 14,
    marginTop: 12,
    marginLeft: -8,
  },
  sidebar: {
    background: 'white',
    borderRadius: 20,
    padding: 18,
    boxShadow: '0 10px 25px rgba(0,0,0,.15)',
    minWidth: 0,
    position: 'sticky' as const,
    top: 16,
  },
  currentPlayer: {
    textAlign: 'center',
  },
  bigToken: {
    width: 78,
    height: 78,
    margin: '0 auto 8px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 30%, #fff, #dfeaff 60%, #b9cdf5)',
    boxShadow: '0 5px 10px rgba(0,0,0,.2), inset 0 -3px 4px rgba(0,0,0,.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 44,
    border: '3px solid white',
  },
  message: {
    background: '#eef5ff',
    borderRadius: 14,
    padding: 14,
    textAlign: 'center',
    margin: '16px 0',
    fontWeight: 'bold',
    minHeight: 60,
    fontSize: '.9rem',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  card: {
    border: 'none',
    borderRadius: 14,
    color: 'white',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: '.2s',
    aspectRatio: '3/4',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: '.85rem',
    boxShadow: '0 6px 0 rgba(0,0,0,.12), 0 8px 14px rgba(0,0,0,.18)',
    position: 'relative' as const,
  },
  cardIcon: {
    fontSize: 26,
  },
  red: { background: 'linear-gradient(160deg, #ff7a7a, #ff4444)' },
  yellow: { background: 'linear-gradient(160deg, #ffe07a, #ffc21a)', color: '#5a4400' },
  green: { background: 'linear-gradient(160deg, #63e08e, #28b85f)' },
  blue: { background: 'linear-gradient(160deg, #7aaeff, #3d78ff)' },
  effectBox: {
    marginTop: 16,
    background: '#f6f6f6',
    borderRadius: 14,
    padding: 14,
    minHeight: 70,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '.85rem',
  },
  restart: {
    width: '100%',
    marginTop: 18,
    padding: 13,
    border: 'none',
    borderRadius: 14,
    background: '#444',
    color: 'white',
    cursor: 'pointer',
    fontSize: 16,
  },
  winScreen: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    overflow: 'hidden',
  },
  winBox: {
    width: 440,
    maxWidth: '90%',
    background: 'white',
    borderRadius: 24,
    padding: 40,
    textAlign: 'center',
    animation: 'pop .4s',
    position: 'relative',
    zIndex: 2,
  },
  trophy: {
    fontSize: 70,
    marginBottom: 6,
    animation: 'heroBounce 1.4s ease-in-out infinite',
  },
  winTitle: {
    fontSize: '1.5rem',
    margin: '10px 0',
  },
  winnerAvatar: {
    fontSize: 80,
    margin: '10px 0',
  },
  stars: {
    fontSize: 26,
    letterSpacing: 4,
    margin: '8px 0 4px',
  },
  playAgain: {
    marginTop: 20,
    border: 'none',
    background: '#36b24f',
    color: 'white',
    fontSize: 20,
    padding: '15px 35px',
    borderRadius: 15,
    cursor: 'pointer',
  },
  flipOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    perspective: 1400,
  },
  flipCard: {
    width: 270,
    height: 400,
    position: 'relative',
    transformStyle: 'preserve-3d',
    animation: 'flipCard 1.1s ease forwards',
  },
  flipFace: {
    position: 'absolute',
    inset: 0,
    borderRadius: 26,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,.45)',
    color: 'white',
    fontWeight: 'bold',
    padding: 18,
    textAlign: 'center',
  },
  flipFront: {
    background: 'repeating-linear-gradient(45deg, #2b2b40, #2b2b40 12px, #3a3a55 12px, #3a3a55 24px)',
    fontSize: 72,
  },
  flipBack: {
    transform: 'rotateY(180deg)',
    fontSize: 22,
    gap: 12,
  },
  flipEffectText: {
    fontSize: 27,
    lineHeight: 1.3,
  },
  flipLabel: {
    fontSize: 15,
    opacity: .85,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  avatars: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: 16,
  },
  avatar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    fontSize: 44,
    padding: '16px 8px 12px',
    border: '3px solid #e3ecfb',
    borderRadius: 18,
    cursor: 'pointer',
    background: '#f8faff',
    transition: '.2s',
  },
  avatarSelected: {
    borderColor: '#4d8dff',
    background: '#e4efff',
    boxShadow: '0 0 0 4px rgba(77,141,255,.25)',
    animation: 'hop .35s ease',
  },
  avatarDisabled: {
    opacity: .3,
    cursor: 'not-allowed',
  },
  pickingFor: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  avatarLabel: {
    fontSize: '.72rem',
    color: '#777',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '.5px',
  },
};