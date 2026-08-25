import { AnimalDisplay } from './AnimalDisplay';
import { Feedback } from './Feedback';

export function ActPanel({ currentAnimal, actState, onCheck }) {
  const sentence = currentAnimal ? `I see a ${currentAnimal.name}.` : 'I see a giraffe.';

  return (
    <section className="panel" id="panel-act" role="tabpanel">
      <div className="instruction">
        🎭 Act & Say! <small>— Act like the animal and say the sentence.</small>
      </div>

      <div className="act-card">
        <AnimalDisplay emoji={currentAnimal?.emoji || '🦒'} name={currentAnimal?.name || 'giraffe'} revealed={actState.revealed} compact />
        <div className="speech-bubble">{sentence}</div>
        <div style={{ marginTop: 6, fontSize: 15, color: '#7a6248' }}>🗣️ Say it out loud!</div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-success" id="actCheckBtn" onClick={onCheck} disabled={actState.done} type="button">
          ✅ I said it!
        </button>
      </div>

      <Feedback tone={actState.revealed ? 'correct' : 'hint'}>{actState.feedback}</Feedback>
    </section>
  );
}
