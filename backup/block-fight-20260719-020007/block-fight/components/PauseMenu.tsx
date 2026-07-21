type PauseMenuProps = {
  onResume: () => void;
};

export default function PauseMenu({ onResume }: PauseMenuProps) {
  return (
    <div style={{ display: 'none' }}>
      <button type="button" onClick={onResume}>Resume</button>
    </div>
  );
}
