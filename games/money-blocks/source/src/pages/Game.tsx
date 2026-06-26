import React from 'react';
import { useGame } from '../context/GameContext';
import { Topbar } from '../components/HUD/Topbar';
import { Board } from '../components/Board/Board';
import { Scoreboard } from '../components/Scoreboard/Scoreboard';
import { SideControls } from '../components/HUD/SideControls';
import { WelcomeScreen } from '../components/Common/WelcomeScreen';
import { SetupScreen } from '../components/Common/SetupScreen';
import { WinnerScreen } from '../components/Common/WinnerScreen';

/** The single-page game screen: welcome → setup → playing → ended, all driven by GameContext. */
export function Game() {
  const { state, goToSetup, startGame, reset } = useGame();

  if (state.phase === 'welcome') {
    return <WelcomeScreen onBegin={goToSetup} />;
  }

  if (state.phase === 'setup') {
    return <SetupScreen onStart={startGame} />;
  }

  return (
    <div className="layout">
      <div className="board-area">
        <Topbar />
        <Board />
      </div>
      <div className="side">
        <Scoreboard />
        <SideControls />
      </div>

      {state.phase === 'ended' && state.endResult && (
        <WinnerScreen endResult={state.endResult} onPlayAgain={reset} />
      )}
    </div>
  );
}
