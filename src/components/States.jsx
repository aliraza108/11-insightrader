export const EmptyState = ({ title, description, action }) => (
  <div className="radar-card p-8 text-center">
    <p className="text-lg font-semibold">{title}</p>
    <p className="mt-2 text-sm text-radar-muted">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="radar-card p-8 text-center">
    <p className="text-lg font-semibold">Could not load data</p>
    <p className="mt-2 text-sm text-radar-muted">Error: {error}</p>
    {onRetry && (
      <button type="button" className="mt-4 radar-button-primary" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);
