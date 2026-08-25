export function Feedback({ tone = 'hint', children }) {
  const className = `feedback ${tone}`;
  return <div className={className}>{children}</div>;
}
