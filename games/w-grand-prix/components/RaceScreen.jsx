import { EMOJIS, PLAYER_COLORS, TRACK_TOTAL } from '../game/constants';
import { CardHand } from './CardHand';
import { RaceLog } from './RaceLog';
import { RaceTrack } from './RaceTrack';
import { WinnerScreen } from './WinnerScreen';

export function RaceScreen({ positions, currentPlayer, cards, log, winner, animating, timeLeft, names, numPlayers, playCard, onNewRace }) {
  return (
    <main className="grand-prix race-screen">
      <h2>🏁 W GRAND PRIX</h2>
      <RaceTrack positions={positions} />
      <div className="player-status">{Array.from({ length: numPlayers }, (_, index) => <div key={index} className={index === currentPlayer && winner === null ? 'current' : ''} style={{ borderColor: PLAYER_COLORS[index] }}>{EMOJIS[index]} <strong style={{ color: PLAYER_COLORS[index] }}>{names[index]}</strong> <span>{positions[index]}/{TRACK_TOTAL}</span></div>)}</div>
      {winner !== null ? <WinnerScreen winner={winner} names={names} onNewRace={onNewRace} /> : <section className="turn-panel"><p>{EMOJIS[currentPlayer]} {names[currentPlayer]}'s turn <span className={timeLeft <= 3 ? 'urgent' : ''}>⏱ {timeLeft}s</span></p><CardHand cards={cards} disabled={animating} onPlay={playCard} /></section>}
      <RaceLog entries={log} />
    </main>
  );
}
