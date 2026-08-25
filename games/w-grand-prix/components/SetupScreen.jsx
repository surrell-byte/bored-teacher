import { EMOJIS } from '../game/constants';

export function SetupScreen({ numPlayers, setNumPlayers, names, setNames, onStart }) {
  return (
    <div className="grand-prix setup-screen">
      <div className="race-flag">🏁</div><h1>W GRAND PRIX</h1><p>Card-based racing championship</p>
      <div className="driver-count">Drivers: {[2, 3, 4].map((number) => <button key={number} className={numPlayers === number ? 'selected' : ''} onClick={() => setNumPlayers(number)} type="button">{number}</button>)}</div>
      {Array.from({ length: numPlayers }, (_, index) => <label key={index} className="driver-input"><span>{EMOJIS[index]}</span><input value={names[index]} onChange={(event) => setNames((previous) => previous.map((name, nameIndex) => nameIndex === index ? event.target.value : name))} /></label>)}
      <button className="start-race" onClick={onStart} type="button">🏁 Start Race!</button>
    </div>
  );
}
