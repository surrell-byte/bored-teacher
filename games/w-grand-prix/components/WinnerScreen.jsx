import { EMOJIS } from '../game/constants';

export function WinnerScreen({ winner, names, onNewRace }) {
  return (
    <div className="winner-screen">
      <div className="winner-icon">🏆</div>
      <div>{EMOJIS[winner]} {names[winner]} wins!</div>
      <button type="button" onClick={onNewRace}>🔄 New Race</button>
    </div>
  );
}
