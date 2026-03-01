export const ProgressBar = ({ value }) => (
  <div className="h-3 w-full rounded-full bg-slate-800">
    <div
      className="h-3 rounded-full bg-radar-primary transition-all duration-500"
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);
