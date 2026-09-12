export function AnimalDisplay({ emoji, revealed, compact = false }) {
  return (
    <div className="animal-display" style={compact ? { minHeight: 270, padding: 14 } : undefined}>
      <div className={`animal-emoji ${revealed ? 'revealed' : 'partial'}`}>{emoji}</div>
    </div>
  );
}
