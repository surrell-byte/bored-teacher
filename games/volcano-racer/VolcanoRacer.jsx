import { useCallback, useEffect, useMemo, useState } from 'react';
import './volcanoRacer.css';

const TRACK_TILES = 16;
const FINISH_TILE = TRACK_TILES + 1;
const CARS = [
  { id: 'red', name: 'Red Racer', color: '#e54b3c', icon: '🏎️' },
  { id: 'blue', name: 'Blue Bolt', color: '#2e86de', icon: '🚗' },
  { id: 'green', name: 'Green Growler', color: '#3fae52', icon: '🚙' },
  { id: 'yellow', name: 'Yellow Yeti', color: '#f0c419', icon: '🏍️' },
];
const CARDS = [
  { id: 'quick', label: 'Quick Dash', description: 'Move 2-4 spaces', min: 2, max: 4, color: '#ff8f3c' },
  { id: 'burnout', label: 'Burnout', description: 'Risky reverse move', min: -3, max: -1, color: '#7a5c4f' },
  { id: 'ice', label: 'Ice Cold', description: 'Freeze the next rival turn', min: 0, max: 0, color: '#4fc3f7' },
  { id: 'boost', label: 'Super Boost', description: 'Rocket forward 4-6', min: 4, max: 6, color: '#ffd83c' },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createPlayer(name, car) {
  return { name, car, position: 0, skipNext: false };
}

function tileEffect(position) {
  if (position === 4 || position === 12) return { delta: 1, message: '🌿 Green vent: bonus +1!' };
  if (position === 8 || position === 15) return { delta: -2, message: '🌋 Lava crack: back 2 spaces!' };
  return { delta: 0, message: '' };
}

function Track({ players }) {
  return (
    <div className="volcano-track" aria-label="Volcano race track">
      {Array.from({ length: FINISH_TILE + 1 }, (_, tile) => (
        <div className={`volcano-tile ${tile === FINISH_TILE ? 'finish' : ''}`} key={tile}>
          <span>{tile === FINISH_TILE ? '🏁' : tile}</span>
          <div className="tile-racers">
            {players.filter((player) => player.position === tile).map((player) => <span key={player.name} title={player.name}>{player.car.icon}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VolcanoRacer({ onComplete }) {
  const [screen, setScreen] = useState('welcome');
  const [mode, setMode] = useState('solo');
  const [names, setNames] = useState(['', '']);
  const [selectedCars, setSelectedCars] = useState([CARS[0], CARS[1]]);
  const [players, setPlayers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [winner, setWinner] = useState(null);
  const [log, setLog] = useState([]);

  const activePlayer = players[current];
  const availableCards = useMemo(() => CARDS.filter((card) => card.id !== 'boost' || (activePlayer?.position ?? 0) >= 8), [activePlayer]);

  const finishGame = useCallback((winnerIndex, nextPlayers) => {
    setPlayers(nextPlayers);
    setWinner(winnerIndex);
    setScreen('victory');
    onComplete?.(100, 100);
  }, [onComplete]);

  const startRace = useCallback(() => {
    const firstName = names[0].trim() || 'Player 1';
    const secondName = mode === 'two' ? (names[1].trim() || 'Player 2') : 'Volcano CPU';
    const nextPlayers = [createPlayer(firstName, selectedCars[0]), createPlayer(secondName, selectedCars[1])];
    setPlayers(nextPlayers);
    setCurrent(0);
    setWinner(null);
    setLog([]);
    setMessage(`${firstName}, choose a card to start your race.`);
    setScreen('race');
  }, [mode, names, selectedCars]);

  const nextTurn = useCallback((nextPlayers, playerIndex) => {
    const nextIndex = (playerIndex + 1) % nextPlayers.length;
    setCurrent(nextIndex);
    setBusy(false);
    setMessage(`${nextPlayers[nextIndex].name}'s turn.`);
  }, []);

  const playCard = useCallback((card) => {
    if (busy || !activePlayer || winner !== null) return;
    setBusy(true);
    const playerIndex = current;
    const opponentIndex = (playerIndex + 1) % players.length;
    const amount = randomInt(card.min, card.max);
    const nextPlayers = players.map((player) => ({ ...player }));
    const player = { ...nextPlayers[playerIndex] };
    const entries = [`${player.name} played ${card.label}.`];

    if (card.id === 'ice') {
      nextPlayers[opponentIndex].skipNext = true;
      entries.push(`${nextPlayers[opponentIndex].name} is frozen next turn.`);
    } else {
      player.position = Math.max(0, Math.min(FINISH_TILE, player.position + amount));
      const effect = tileEffect(player.position);
      player.position = Math.max(0, Math.min(FINISH_TILE, player.position + effect.delta));
      entries.push(`${amount >= 0 ? '+' : ''}${amount} spaces. ${effect.message}`);
    }
    nextPlayers[playerIndex] = player;
    setLog((previous) => [...entries, ...previous].slice(0, 12));

    if (player.position >= FINISH_TILE) {
      finishGame(playerIndex, nextPlayers);
      return;
    }

    const targetIndex = playerIndex === 0 && mode === 'solo' ? 1 : null;
    if (targetIndex !== null) {
      setPlayers(nextPlayers);
      setMessage('The Volcano CPU is choosing a card...');
      setTimeout(() => {
        const cpuCard = CARDS[randomInt(0, CARDS.length - 1)];
        const cpu = { ...nextPlayers[1] };
        if (cpu.skipNext) {
          cpu.skipNext = false;
          const afterSkip = [{ ...nextPlayers[0] }, cpu];
          setPlayers(afterSkip);
          setLog((previous) => [`${cpu.name} loses a turn to the ice!`, ...previous].slice(0, 12));
          nextTurn(afterSkip, 1);
          return;
        }
        const cpuMove = cpuCard.id === 'ice' ? 0 : randomInt(cpuCard.min, cpuCard.max);
        cpu.position = Math.max(0, Math.min(FINISH_TILE, cpu.position + cpuMove));
        const afterCpu = [{ ...nextPlayers[0] }, cpu];
        setPlayers(afterCpu);
        setLog((previous) => [`${cpu.name} played ${cpuCard.label} (${cpuMove >= 0 ? '+' : ''}${cpuMove}).`, ...previous].slice(0, 12));
        if (cpu.position >= FINISH_TILE) finishGame(1, afterCpu);
        else nextTurn(afterCpu, 1);
      }, 650);
      return;
    }

    if (nextPlayers[opponentIndex].skipNext) {
      nextPlayers[opponentIndex].skipNext = false;
      setPlayers(nextPlayers);
      setLog((previous) => [`${nextPlayers[opponentIndex].name} loses a turn to the ice!`, ...previous].slice(0, 12));
      setMessage(`${nextPlayers[opponentIndex].name} is frozen and skips.`);
      setTimeout(() => nextTurn(nextPlayers, opponentIndex), 500);
      return;
    }

    setPlayers(nextPlayers);
    setTimeout(() => nextTurn(nextPlayers, playerIndex), 450);
  }, [activePlayer, busy, current, finishGame, mode, nextTurn, players, winner]);

  function chooseCar(index, car) {
    setSelectedCars((previous) => previous.map((selected, carIndex) => carIndex === index ? car : selected));
  }

  function reset() {
    setScreen('welcome');
    setPlayers([]);
    setNames(['', '']);
    setBusy(false);
    setWinner(null);
  }

  useEffect(() => {
    if (screen !== 'race' || mode !== 'solo' || current !== 1 || busy || winner !== null) return undefined;
    if (activePlayer?.skipNext) {
      const timer = setTimeout(() => {
        setPlayers((previous) => previous.map((player, index) => index === 1 ? { ...player, skipNext: false } : player));
        nextTurn(players, 1);
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activePlayer, busy, current, mode, nextTurn, players, screen, winner]);

  if (screen === 'welcome') return <div className="volcano-racer volcano-screen"><div className="volcano-hero"><p>CANVAS CARD RACER</p><h1>VOLCANO<br /><em>RACER</em></h1><div className="volcano-icons">🌋 🏎️ 🌋</div><button className="volcano-primary" onClick={() => setScreen('setup')}>START ENGINES</button><small>Cards · Volcano hazards · Local multiplayer</small></div></div>;

  if (screen === 'setup') return <div className="volcano-racer volcano-screen"><h2>GET READY</h2><p className="volcano-subtitle">Racing solo against the CPU, or pass-and-play?</p><div className="volcano-mode"><button className={mode === 'solo' ? 'selected' : ''} onClick={() => setMode('solo')} type="button">1 PLAYER</button><button className={mode === 'two' ? 'selected' : ''} onClick={() => setMode('two')} type="button">2 PLAYERS</button></div><div className="volcano-name-fields"><input value={names[0]} placeholder="PLAYER 1 NAME" onChange={(event) => setNames((previous) => [event.target.value, previous[1]])} /><input value={names[1]} placeholder="PLAYER 2 NAME" disabled={mode !== 'two'} onChange={(event) => setNames((previous) => [previous[0], event.target.value])} /></div><button className="volcano-primary" onClick={() => setScreen('cars')}>CHOOSE YOUR CAR</button></div>;

  if (screen === 'cars') return <div className="volcano-racer volcano-screen"><h2>PICK YOUR RIDE</h2><div className="volcano-car-pickers">{[0, 1].map((index) => <section key={index}><strong>{index === 0 ? names[0].trim() || 'PLAYER 1' : mode === 'two' ? names[1].trim() || 'PLAYER 2' : 'VOLCANO CPU'}</strong><div className="volcano-selected-car" style={{ borderColor: selectedCars[index].color }}>{selectedCars[index].icon}</div><div className="volcano-car-grid">{CARS.map((car) => <button className={selectedCars[index].id === car.id ? 'selected' : ''} style={{ borderColor: car.color }} onClick={() => chooseCar(index, car)} key={car.id} type="button">{car.icon}</button>)}</div></section>)}</div><button className="volcano-primary" onClick={startRace}>START RACE 🏁</button></div>;

  if (screen === 'victory') return <div className="volcano-racer volcano-screen"><div className="volcano-victory"><div>🏆</div><h1>{players[winner]?.name} WINS!</h1><p>{players[winner]?.car.icon} First across the finish line.</p><button className="volcano-primary" onClick={reset}>RACE AGAIN</button></div></div>;

  return <div className="volcano-racer volcano-race"><header><strong>🌋 VOLCANO RACER</strong><span>{activePlayer?.name}'S TURN</span><button onClick={reset} type="button">QUIT</button></header><main><p className="volcano-message">{message}</p><Track players={players} /><div className="volcano-controls"><h2>{activePlayer?.name}: CHOOSE A CARD</h2><div className="volcano-card-hand">{availableCards.map((card) => <button className="volcano-card" style={{ borderTopColor: card.color }} onClick={() => playCard(card)} disabled={busy || (activePlayer?.skipNext ?? false)} key={card.id} type="button"><strong>{card.label}</strong><span>{card.description}</span></button>)}</div></div><div className="volcano-log">{log.map((entry, index) => <div key={`${entry}-${index}`}>{entry}</div>)}</div></main></div>;
}
