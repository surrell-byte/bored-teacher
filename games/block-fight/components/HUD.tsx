type HUDProps = {
  score: number;
  hp: number;
  worldName: string;
};

export default function HUD({ score, hp, worldName }: HUDProps) {
  return (
    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>⭐ {score}</span>
        <span style={{ color: '#6366f1', fontWeight: 800, fontSize: '1.3rem', letterSpacing: 2 }}>BLOCK FIGHT</span>
        <span style={{ color: '#f87171' }}>{Array.from({ length: 3 }, (_, index) => index < hp ? '❤️' : '🖤').join('')}</span>
      </div>
      <span style={{ color: '#94a3b8', fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase' }}>{worldName}</span>
    </div>
  );
}
