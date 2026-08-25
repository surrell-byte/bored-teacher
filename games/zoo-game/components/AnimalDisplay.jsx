export function AnimalDisplay({ emoji, name, revealed, compact = false }) {
  return (
    <div className="animal-display" style={compact ? { minHeight: 190, padding: 14 } : undefined}>
      <div className={`animal-emoji ${revealed ? 'revealed' : 'partial'}`}>{emoji}</div>
      <div className={`animal-name ${revealed ? '' : 'hidden'}`}>{name}</div>
    </div>
  );
}
