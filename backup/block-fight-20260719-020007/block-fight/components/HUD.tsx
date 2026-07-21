type HUDProps = {
  score: number;
  hp: number;
};

export default function HUD({ score, hp }: HUDProps) {
  return (
    <div style={{ marginBottom: 12, display: 'flex', gap: 24, alignItems: 'center' }}>
      <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>⭐ {score}</span>
      <span style={{ color: '#6366f1', fontWeight: 800, fontSize: '1.3rem', letterSpacing: 2 }}>BLOCK FIGHT</span>
      <span style={{ color: '#f87171' }}>{Array.from({ length: 3 }, (_, index) => index < hp ? '❤️' : '🖤').join('')}</span>
    </div>
  );
}
