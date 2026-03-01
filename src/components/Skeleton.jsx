export const SkeletonLine = ({ className = "" }) => (
  <div className={`skeleton h-4 ${className}`} />
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`radar-card p-5 ${className}`}>
    <div className="space-y-3">
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-4 w-1/3" />
    </div>
  </div>
);
