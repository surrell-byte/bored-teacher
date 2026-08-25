import { AnimalDisplay } from './AnimalDisplay';
import { Attempts } from './Attempts';
import { Feedback } from './Feedback';

export function LookPanel({
  currentAnimal,
  lookState,
  onSelect,
  onHint,
}) {
  return (
    <section className="panel" id="panel-look" role="tabpanel">
      <div className="instruction">
        👀 Look, Listen & Say! <small>— Complete the sentence.</small>
      </div>

      <AnimalDisplay
        emoji={currentAnimal?.emoji || '🦒'}
        name={currentAnimal?.name || 'giraffe'}
        revealed={lookState.revealed}
        compact
      />

      <div className="sentence-builder" id="sentenceBuilder">
        <span className="word">I</span>
        <span className="word">see</span>
        <span className="word" id="lookArticle">{lookState.article}</span>
        <span className={`blank ${lookState.blank !== '⋯' ? 'filled' : ''}`} id="lookBlank">{lookState.blank}</span>
        <span className="word">in</span>
        <span className="word">the</span>
        <span className="word">zoo.</span>
      </div>

      <div className="options-grid" id="lookOptions" style={{ maxWidth: 480 }}>
        {lookState.options.map((option) => (
          <button
            key={`${option.name}-${option.emoji || 'look'}`}
            className={option.status === 'correct' ? 'option-btn selected-correct' : option.status === 'wrong' ? 'option-btn selected-wrong' : 'option-btn'}
            type="button"
            disabled={option.disabled}
            onClick={() => onSelect(option.name)}
          >
            <span className="opt-label">{option.name}</span>
          </button>
        ))}
      </div>

      <Attempts used={lookState.attemptsUsed} />

      <div className="action-buttons">
        <button className="btn btn-blue" id="lookHintBtn" onClick={onHint} disabled={lookState.hintDisabled} type="button">
          💡 Hint
        </button>
      </div>

      <Feedback tone={lookState.revealed ? 'correct' : 'hint'}>{lookState.feedback}</Feedback>
    </section>
  );
}
