import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout.jsx";
import { Badge } from "../components/Badge.jsx";
import { SkeletonCard } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/States.jsx";
import { useCountUp } from "../hooks/useCountUp.js";
import { apiRequest } from "../utils/api.js";
import { formatDate, impactColor } from "../utils/format.js";

const StatCard = ({ label, value }) => {
  const count = useCountUp(value);
  return (
    <div className="radar-card p-5">
      <p className="text-xs uppercase tracking-wide text-radar-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{count}</p>
    </div>
  );
};

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/report/dashboard");
      setData(res.dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppLayout title="Dashboard">
      {loading && (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState error={error} onRetry={load} />}

      {!loading && data && (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Competitors Tracked" value={data.competitors_tracked} />
            <StatCard label="Total Snapshots" value={data.total_snapshots} />
            <StatCard label="Changes Last 7d" value={data.changes_last_7_days} />
            <StatCard label="Critical Alerts" value={data.high_impact_changes_30d} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="radar-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent High-Impact Changes</h3>
                <button
                  type="button"
                  className="text-xs text-radar-primary hover:text-white"
                  onClick={() => navigate("/changes")}
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {data.recent_high_impact?.length ? (
                  data.recent_high_impact.map((item, idx) => (
                    <button
                      key={`${item.change_type}-${idx}`}
                      type="button"
                      onClick={() => navigate("/changes")}
                      className="flex w-full items-center justify-between rounded-xl border border-radar-border bg-slate-900/60 px-4 py-3 text-left hover:border-radar-primary/60"
                    >
                      <div>
                        <p className="text-sm font-semibold capitalize">{item.change_type}</p>
                        <p className="text-xs text-radar-muted">{item.summary}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={impactColor(item.impact_score)}>Score {item.impact_score}</Badge>
                        <p className="mt-2 text-xs text-radar-muted">{formatDate(item.detected_at)}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-radar-muted">No high-impact changes yet.</p>
                )}
              </div>
            </div>

            <div className="radar-card p-6">
              <h3 className="text-lg font-semibold">Competitors</h3>
              <div className="mt-4 space-y-3">
                {data.competitor_list?.length ? (
                  data.competitor_list.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between rounded-xl border border-radar-border bg-slate-900/60 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{comp.name}</p>
                        <p className="text-xs text-radar-muted">{comp.urls} URLs tracked</p>
                      </div>
                      <span className="text-xs text-radar-muted">Active</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-radar-muted">No competitors yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default DashboardPage;
