import { GameOverOverlay } from './GameOverOverlay';

export function PacManCanvas({ canvasRef, phase, score, onRestart }) {
  return <div className="pacman-board"><canvas ref={canvasRef} />{phase !== 'playing' ? <GameOverOverlay phase={phase} score={score} onRestart={onRestart} /> : null}</div>;
}
