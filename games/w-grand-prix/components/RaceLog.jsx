export function RaceLog({ entries }) {
  return <div className="race-log">{entries.map((entry, index) => <div key={`${entry}-${index}`}>{entry}</div>)}</div>;
}
