type LoadingSpinnerProps = {
  label?: string;
};

export default function LoadingSpinner({ label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="loading-spinner-dot" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
