export function Attempts({ used, total = 3 }) {
  return (
    <div className="attempts-track">
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={`dot ${index < used ? 'used' : ''}`} />
      ))}
    </div>
  );
}
