export function VictoryOverlay({ visible, message, onReplay }) {
  if (!visible) return null;

  return (
    <div className="zoo-victory" role="status" aria-live="polite">
      {message}
      <button type="button" onClick={onReplay}>Play this level again</button>
    </div>
  );
}
