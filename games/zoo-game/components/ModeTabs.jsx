export function ModeTabs({ modes, activeTab, onChange }) {
  const modeLabels = {
    guess: '🤔 Guess & Say',
    act: '🎭 Act & Say',
    look: '👀 Look, Listen & Say',
  };

  return (
    <div className="tabs" role="tablist" aria-label="Game modes">
      {modes.map((mode) => {
        const isActive = mode === activeTab;

        return (
          <button
            key={mode}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            data-tab={mode}
            role="tab"
            aria-selected={isActive ? 'true' : 'false'}
            onClick={() => onChange(mode)}
            type="button"
          >
            {modeLabels[mode]}
          </button>
        );
      })}
    </div>
  );
}
