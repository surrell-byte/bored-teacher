import { Attempts } from './Attempts';
import { AnimalDisplay } from './AnimalDisplay';
import { Feedback } from './Feedback';

export function GuessPanel({
  currentAnimal,
  guessState,
  onSelect,
  onReveal,
}) {
  const animalName = currentAnimal ? currentAnimal.name : 'giraffe';
  const optionClassNames = (option) => {
    if (option.status === 'correct') return 'option-btn selected-correct';
    if (option.status === 'wrong') return 'option-btn selected-wrong';
    return 'option-btn';
  };

  return (
    <section className="panel active" id="panel-guess" role="tabpanel">
      <div className="instruction">
        🕵️‍♂️ Guess! <small>— What animal do you see?</small>
      </div>

      <AnimalDisplay
        emoji={currentAnimal?.emoji || '🦒'}
        name={animalName}
        revealed={guessState.revealed}
      />

      <div className="options-grid" id="guessOptions">
        {guessState.options.map((option) => (
          <button
            key={`${option.name}-${option.emoji || 'opt'}`}
            className={optionClassNames(option)}
            type="button"
            disabled={option.disabled}
            onClick={() => onSelect(option.name)}
          >
            <span className="opt-label">{option.name}</span>
          </button>
        ))}
      </div>

      <Attempts used={guessState.attemptsUsed} />
      <Feedback tone={guessState.revealed ? 'correct' : 'hint'}>{guessState.feedback}</Feedback>
      {onReveal ? <div aria-hidden="true" /> : null}
    </section>
  );
}
