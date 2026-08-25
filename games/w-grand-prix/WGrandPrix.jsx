import { useState } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { RaceScreen } from './components/RaceScreen';
import { useGrandPrix } from './hooks/useGrandPrix';
import './styles/grandPrix.css';

export default function WGrandPrix({ onComplete }) {
  const [screen, setScreen] = useState('setup');
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState(['Driver 1', 'Driver 2', 'Driver 3', 'Driver 4']);
  const game = useGrandPrix({ numPlayers, names, onComplete });

  if (screen === 'setup') {
    return (
      <SetupScreen
        numPlayers={numPlayers}
        setNumPlayers={setNumPlayers}
        names={names}
        setNames={setNames}
        onStart={() => {
          game.startGame();
          setScreen('game');
        }}
      />
    );
  }

  return <RaceScreen {...game} names={names} numPlayers={numPlayers} onNewRace={() => setScreen('setup')} />;
}
