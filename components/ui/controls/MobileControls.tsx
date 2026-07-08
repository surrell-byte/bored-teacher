type MobileControlsProps = {
  onLeft?: () => void;
  onRight?: () => void;
  onJump?: () => void;
};

export default function MobileControls({ onLeft, onRight, onJump }: MobileControlsProps) {
  return (
    <div className="mobile-controls" aria-label="Mobile controls">
      <button type="button" aria-label="Move left" onClick={onLeft}>
        ←
      </button>
      <button type="button" aria-label="Jump" onClick={onJump}>
        ↑
      </button>
      <button type="button" aria-label="Move right" onClick={onRight}>
        →
      </button>
    </div>
  );
}
