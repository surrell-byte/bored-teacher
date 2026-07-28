'use client';

import { useMemo, useState } from 'react';

const TARGET_SCORE = 5;
const POWER_TILES = ['extra', 'bomb', 'swap', 'reveal'];
const POWER_ICONS = { extra: '⭐', bomb: '💣', swap: '🔄', reveal: '👁' };
const PLAYER_COLOURS = ['#e85c58', '#5a91f2'];

const shuffle = list => [...list].sort(() => Math.random() - 0.5);
function createBoard() {
  const tiles = [
    ...Array.from({ length: TARGET_SCORE }, () => ({ type: 'colour', owner: 0 })),
    ...Array.from({ length: TARGET_SCORE }, () => ({ type: 'colour', owner: 1 })),
    ...POWER_TILES.map(type => ({ type })),
    ...Array.from({ length: 25 - TARGET_SCORE * 2 - POWER_TILES.length }, () => ({ type: 'blank' })),
  ];
  return shuffle(tiles).map((tile, index) => ({ ...tile, id: index, revealed: false }));
}

export default function HiddenColours({ onComplete }) {
  const [screen, setScreen] = useState('welcome');
  const [names, setNames] = useState(['Player 1', 'Player 2']);
  const [players, setPlayers] = useState([{ score: 0 }, { score: 0 }]);
  const [turn, setTurn] = useState(0);
  const [board, setBoard] = useState(() => createBoard());
  const [notice, setNotice] = useState('Choose a mystery tile to reveal its hidden colour.');
  const [winner, setWinner] = useState(null);

  const found = players[0].score + players[1].score;
  const startGame = () => {
    setPlayers([{ score: 0 }, { score: 0 }]);
    setTurn(0);
    setBoard(createBoard());
    setWinner(null);
    setNotice('Find five tiles in your colour to win.');
    setScreen('game');
  };
  const resetGame = () => startGame();
  const updateScore = (playerIndex, amount) => setPlayers(current => current.map((player, index) => index === playerIndex ? { ...player, score: Math.max(0, player.score + amount) } : player));
  const finishIfWon = nextPlayers => {
    const winnerIndex = nextPlayers.findIndex(player => player.score >= TARGET_SCORE);
    if (winnerIndex < 0) return false;
    setWinner(winnerIndex);
    setNotice(`${names[winnerIndex]} found all five hidden colours!`);
    onComplete?.(nextPlayers[winnerIndex].score * 100, 100);
    return true;
  };
  const revealNeighbours = (sourceIndex, tiles) => {
    const row = Math.floor(sourceIndex / 5);
    const col = sourceIndex % 5;
    return tiles.map((tile, index) => {
      const tileRow = Math.floor(index / 5);
      const tileCol = index % 5;
      return Math.abs(tileRow - row) <= 1 && Math.abs(tileCol - col) <= 1 ? { ...tile, revealed: true } : tile;
    });
  };
  const reveal = tileIndex => {
    if (winner || board[tileIndex].revealed) return;
    const tile = board[tileIndex];
    setBoard(current => current.map((item, index) => index === tileIndex ? { ...item, revealed: true } : item));

    if (tile.type === 'colour') {
      const scoringPlayer = tile.owner;
      const nextPlayers = players.map((player, index) => index === scoringPlayer ? { ...player, score: player.score + 1 } : player);
      setPlayers(nextPlayers);
      if (!finishIfWon(nextPlayers)) {
        setNotice(scoringPlayer === turn ? `Nice find! ${names[turn]} scores a hidden colour.` : `${names[scoringPlayer]} gains the point — their colour was revealed.`);
        setTurn(turn === 0 ? 1 : 0);
      }
      return;
    }
    if (tile.type === 'extra') {
      setNotice(`⭐ Extra turn! ${names[turn]} plays again.`);
      return;
    }
    if (tile.type === 'bomb') {
      updateScore(turn, -1);
      setNotice(`💣 Bomb! ${names[turn]} loses one point.`);
      setTurn(turn === 0 ? 1 : 0);
      return;
    }
    if (tile.type === 'swap') {
      const nextPlayers = [{ score: players[1].score }, { score: players[0].score }];
      setPlayers(nextPlayers);
      setNotice('🔄 Swap! The player scores have changed places.');
      if (!finishIfWon(nextPlayers)) setTurn(turn === 0 ? 1 : 0);
      return;
    }
    if (tile.type === 'reveal') {
      setBoard(current => revealNeighbours(tileIndex, current));
      setNotice('👁 Reveal! Nearby tiles are now visible, but no points are awarded.');
      setTurn(turn === 0 ? 1 : 0);
      return;
    }
    setNotice('Empty tile — the other player takes a turn.');
    setTurn(turn === 0 ? 1 : 0);
  };

  if (screen === 'welcome') return <main className="hidden-colours hidden-colours--welcome"><style>{HIDDEN_COLOURS_STYLES}</style><section className="hidden-colours__welcome-card"><span>🎨</span><h1>Hidden Colours</h1><p>Reveal mystery tiles, find your colour, and use power tiles to outsmart your opponent.</p><div className="hidden-colours__name-fields">{names.map((name, index) => <label key={index}>Player {index + 1}<input value={name} maxLength={16} onChange={event => setNames(current => current.map((value, playerIndex) => playerIndex === index ? event.target.value || `Player ${index + 1}` : value))} /></label>)}</div><button type="button" className="hidden-colours__play" onClick={startGame}>Play Hidden Colours</button></section></main>;

  return <main className="hidden-colours"><style>{HIDDEN_COLOURS_STYLES}</style><section className="hidden-colours__shell">
    <div className="hidden-colours__left">
      <div className="hidden-colours__progress-area"><div className="hidden-colours__progress-top"><span>{found} / {TARGET_SCORE * 2} colours found</span><span>{notice}</span></div><div className="hidden-colours__progress-bar"><div style={{ width: `${(found / (TARGET_SCORE * 2)) * 100}%` }} /></div></div>
      <div className="hidden-colours__grid-wrapper"><div className="hidden-colours__grid">{board.map((tile, index) => <button type="button" aria-label={tile.revealed ? 'Revealed tile' : 'Reveal mystery tile'} key={tile.id} onClick={() => reveal(index)} className={`hidden-colours__tile${tile.revealed ? ' is-revealed' : ''}${tile.type === 'colour' ? ` owner-${tile.owner}` : ''}`}>{tile.revealed && <TileFace tile={tile} />}</button>)}</div></div>
      <div className="hidden-colours__bottom-buttons"><button type="button" onClick={resetGame}>↺ New Game</button><button type="button" onClick={() => setScreen('welcome')}>← Home</button></div>
    </div>
    <aside className="hidden-colours__sidebar"><h3>Player Status</h3><div className="hidden-colours__players-panel">{players.map((player, index) => <div key={index} className={`hidden-colours__player-box${turn === index && !winner ? ' is-active' : ''}`}><span className="hidden-colours__player-dot" style={{ background: PLAYER_COLOURS[index] }} /><strong>{names[index]}</strong><b>{player.score}</b><small>of {TARGET_SCORE} found</small></div>)}</div><div className="hidden-colours__turn-card"><i />{winner === null ? `${names[turn]}'s turn` : `${names[winner]} wins!`}</div><div className="hidden-colours__power-panel"><p>Power Tiles</p><span>⭐ Extra Turn</span><span>💣 Bomb</span><span>🔄 Swap</span><span>👁 Reveal</span></div></aside>
  </section></main>;
}

function TileFace({ tile }) {
  if (tile.type === 'colour') return <i className="hidden-colours__colour-dot" />;
  if (tile.type === 'blank') return <span>—</span>;
  return <span className="hidden-colours__power-icon">{POWER_ICONS[tile.type]}</span>;
}

const HIDDEN_COLOURS_STYLES = `
.hidden-colours{min-height:100%;display:grid;place-items:center;padding:clamp(14px,3vw,40px);background:linear-gradient(180deg,#111317,#0c0d10);color:#fff;font-family:Inter,var(--font-body),sans-serif}.hidden-colours *{box-sizing:border-box}.hidden-colours__shell{display:flex;gap:40px;width:min(1400px,95vw);margin:auto;padding:clamp(18px,3vw,40px);background:#17171c;border:1px solid #2d2d35;border-radius:34px;box-shadow:0 30px 60px rgba(0,0,0,.45)}.hidden-colours__left{flex:1;min-width:0;display:flex;flex-direction:column}.hidden-colours__sidebar{width:340px;display:flex;flex-direction:column;gap:20px}.hidden-colours__progress-area{margin-bottom:28px}.hidden-colours__progress-top{display:flex;justify-content:space-between;gap:18px;color:#8f8f99;font-size:.85rem;margin-bottom:10px}.hidden-colours__progress-top span:last-child{text-align:right}.hidden-colours__progress-bar{height:8px;background:#27272f;border-radius:100px;overflow:hidden}.hidden-colours__progress-bar>div{height:100%;background:linear-gradient(90deg,#e6c467,#ffd87d);transition:width .4s}.hidden-colours__grid-wrapper{flex:1;display:grid;place-items:center}.hidden-colours__grid{width:min(100%,760px);display:grid;grid-template-columns:repeat(5,1fr);gap:18px}.hidden-colours__tile{aspect-ratio:1;border:0;border-radius:20px;background:#e5c469;color:#fff;font-size:2rem;font-weight:700;display:flex;justify-content:center;align-items:center;box-shadow:inset 0 2px 4px rgba(255,255,255,.35),0 10px 18px rgba(0,0,0,.25);transition:.2s;cursor:pointer}.hidden-colours__tile:hover:not(.is-revealed){transform:translateY(-6px)}.hidden-colours__tile.is-revealed{background:#29292f;cursor:default}.hidden-colours__tile.owner-0{background:#352326}.hidden-colours__tile.owner-1{background:#202b42}.hidden-colours__colour-dot{width:55%;height:55%;border-radius:50%;background:#e85c58;box-shadow:inset 0 2px 6px rgba(255,255,255,.45),0 3px 10px rgba(0,0,0,.35)}.hidden-colours__tile.owner-1 .hidden-colours__colour-dot{background:#5a91f2}.hidden-colours__tile>span{color:#8f8f99}.hidden-colours__power-icon{font-size:clamp(1.5rem,3vw,2.5rem)!important}.hidden-colours__bottom-buttons{display:flex;gap:16px;margin-top:28px}.hidden-colours__bottom-buttons button{padding:14px 26px;border-radius:999px;background:#23232a;border:1px solid #35353f;color:white;font:600 1rem Inter,var(--font-body),sans-serif;cursor:pointer;box-shadow:none}.hidden-colours__bottom-buttons button:hover{background:#2d2d36;transform:translateY(-2px)}.hidden-colours__sidebar h3{margin:0 0 -10px;font-size:.8rem;letter-spacing:.15em;text-transform:uppercase;color:#6d6d77}.hidden-colours__players-panel{display:grid;grid-template-columns:1fr 1fr;gap:14px}.hidden-colours__player-box{position:relative;display:flex;flex-direction:column;align-items:flex-start;padding:22px;border-radius:22px;background:#222228;border:1px solid #303038;min-height:160px;transition:.25s}.hidden-colours__player-box.is-active{border:2px solid #d8b865;box-shadow:0 0 25px rgba(216,184,101,.25)}.hidden-colours__player-dot{width:12px;height:12px;border-radius:50%;margin-bottom:14px}.hidden-colours__player-box strong{font-size:.9rem;word-break:break-word}.hidden-colours__player-box b{margin-top:auto;color:#e6c467;font-size:2.2rem}.hidden-colours__player-box small{color:#8f8f99;font-size:.72rem}.hidden-colours__turn-card{display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;border-radius:20px;background:#202026;border:1px solid #313139;font-size:1rem;text-align:center}.hidden-colours__turn-card i{width:12px;height:12px;flex:0 0 auto;border-radius:50%;background:#f0c85d;box-shadow:0 0 15px #f0c85d;animation:hidden-colours-pulse 1s infinite}.hidden-colours__power-panel{padding:24px;background:#202026;border-radius:22px;border:1px solid #313139}.hidden-colours__power-panel p{margin:0 0 18px;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:#6d6d77}.hidden-colours__power-panel span{display:block;margin-bottom:12px;padding:10px 14px;background:#282830;border-radius:12px}.hidden-colours__power-panel span:last-child{margin-bottom:0}.hidden-colours--welcome{padding:20px}.hidden-colours__welcome-card{width:min(100%,620px);padding:clamp(30px,6vw,64px);border:1px solid #2d2d35;border-radius:34px;background:#17171c;text-align:center;box-shadow:0 30px 60px rgba(0,0,0,.45)}.hidden-colours__welcome-card>span{font-size:4rem}.hidden-colours__welcome-card h1{margin:12px 0;color:#f0c85d;font-size:clamp(2.2rem,5vw,4rem)}.hidden-colours__welcome-card p{color:#a2a2ac;line-height:1.6}.hidden-colours__name-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:28px 0}.hidden-colours__name-fields label{color:#8f8f99;font-size:.78rem;text-align:left}.hidden-colours__name-fields input{width:100%;margin-top:7px;padding:13px;border:1px solid #35353f;border-radius:12px;background:#23232a;color:#fff;font:inherit}.hidden-colours__play{padding:15px 28px;border:0;border-radius:999px;background:linear-gradient(90deg,#e6c467,#ffd87d);color:#29200f;font:800 1rem Inter,var(--font-body),sans-serif;cursor:pointer}@keyframes hidden-colours-pulse{50%{transform:scale(1.25);opacity:.6}}@media(max-width:900px){.hidden-colours__shell{gap:24px}.hidden-colours__sidebar{width:280px}.hidden-colours__grid{gap:12px}}@media(max-width:720px){.hidden-colours{padding:10px}.hidden-colours__shell{flex-direction:column;padding:18px;border-radius:24px}.hidden-colours__sidebar{width:100%}.hidden-colours__progress-top{flex-direction:column;gap:5px}.hidden-colours__progress-top span:last-child{text-align:left}.hidden-colours__grid{gap:9px}.hidden-colours__tile{border-radius:14px}.hidden-colours__player-box{min-height:120px;padding:16px}.hidden-colours__bottom-buttons button{padding:12px 18px}.hidden-colours__name-fields{grid-template-columns:1fr}}
`;
