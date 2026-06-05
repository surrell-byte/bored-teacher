import { type GameStatus } from '../engine/types';

type GameOverProps = {
  score: number;
  state: Exclude<GameStatus, 'playing'>;
  onRestart: () => void;
};

export default function GameOver({ score, state, onRestart }: GameOverProps) {
  const won = state === 'win';

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', borderRadius: 12,
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>{won ? '🏆' : '💀'}</div>
      <h2 style={{ color: won ? '#fbbf24' : '#f87171', fontSize: '2rem', margin: '0 0 8px' }}>
        {won ? 'Stage Clear!' : 'Game Over'}
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: 20 }}>Score: {score}</p>
      <button onClick={onRestart} style={{
        padding: '12px 28px', borderRadius: 999, border: 'none',
        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
        color: '#fff', fontWeight: 800, cursor: 'pointer',
      }}>🔄 Play Again</button>
    </div>
  );
}
