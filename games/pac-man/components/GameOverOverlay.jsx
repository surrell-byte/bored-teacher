export function GameOverOverlay({ phase, score, onRestart }) {
  const won = phase === 'win';
  return <div className="pacman-overlay"><div className="overlay-icon">{won ? '🏆' : '👻'}</div><h2>{won ? 'You Win!' : 'Game Over'}</h2><p>Score: {score}</p><button type="button" onClick={onRestart}>🔄 Retry</button></div>;
}
