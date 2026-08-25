export function CardHand({ cards, disabled, onPlay }) {
  return (
    <div className="card-hand">
      {cards.map((card, index) => {
        const type = card.delta >= 2 ? 'boost' : card.delta === 1 ? 'overtake' : card.delta === 0 ? 'pit' : 'danger';
        return (
          <button key={`${card.label}-${index}`} className={`race-card ${type}`} disabled={disabled} onClick={() => onPlay(card)} type="button">
            <strong>{card.label}</strong>
            <span>{card.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
