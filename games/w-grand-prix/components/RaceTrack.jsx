import { EMOJIS, TRACK_TOTAL, PLAYER_COLORS } from '../game/constants';
import { SPECIALS } from '../game/specials';

export function RaceTrack({ positions }) {
  return (
    <div className="grand-prix-track">
      {Array.from({ length: TRACK_TOTAL + 1 }, (_, position) => {
        const players = positions.reduce((result, playerPosition, player) => (
          playerPosition === position ? [...result, player] : result
        ), []);
        const special = SPECIALS[position];

        return (
          <div key={position} className={`track-cell ${position === TRACK_TOTAL ? 'finish' : ''} ${special ? 'special' : ''}`}>
            {players.length ? players.map((player) => <span key={player} style={{ color: PLAYER_COLORS[player] }}>{EMOJIS[player]}</span>) : <span>{position === TRACK_TOTAL ? '🏆' : special ? '⚡' : position}</span>}
          </div>
        );
      })}
    </div>
  );
}
