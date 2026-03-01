import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../components/AppLayout.jsx";
import { Badge } from "../components/Badge.jsx";
import { SkeletonCard } from "../components/Skeleton.jsx";
import { EmptyState, ErrorState } from "../components/States.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { apiRequest } from "../utils/api.js";
import { changeTypeColor, formatDate, impactAlertColor } from "../utils/format.js";

const typeOptions = ["all", "pricing", "features", "messaging", "content", "structure"];
const sortOptions = ["Newest", "Highest Impact", "Change Type"];

const ChangesPage = () => {
  const [changes, setChanges] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState("all");
  const [competitorId, setCompetitorId] = useState("all");
  const [highImpact, setHighImpact] = useState(false);
  const [unreviewedOnly, setUnreviewedOnly] = useState(false);
  const [sort, setSort] = useState("Newest");
  const [reviewingId, setReviewingId] = useState(null);
  const toast = useToast();

  const competitorMap = useMemo(() => {
    return competitors.reduce((acc, comp) => {
      acc[comp.competitor_id] = comp.company_name;
      return acc;
    }, {});
  }, [competitors]);

  const loadCompetitors = async () => {
    try {
      const res = await apiRequest("/competitor/list");
      setCompetitors(res.competitors || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const loadChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (highImpact) {
        data = await apiRequest("/changes/high-impact?threshold=7&limit=20");
      } else if (type !== "all") {
        data = await apiRequest(`/changes/by-type/${type}`);
      } else {
        const params = new URLSearchParams({ limit: "20" });
        if (competitorId !== "all") {
          params.set("competitor_id", competitorId);
        }
        data = await apiRequest(`/changes/recent?${params.toString()}`);
      }
      const list = data.changes || data || [];
      setChanges(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

  useEffect(() => {
    loadChanges();
  }, [type, competitorId, highImpact]);

  const filteredChanges = useMemo(() => {
    let list = [...changes];
    if (unreviewedOnly) {
      list = list.filter((item) => item.is_reviewed === "false" || item.is_reviewed === false);
    }
    if (sort === "Highest Impact") {
      list.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0));
    } else if (sort === "Change Type") {
      list.sort((a, b) => (a.change_type || "").localeCompare(b.change_type || ""));
    } else {
      list.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));
    }
    return list;
  }, [changes, unreviewedOnly, sort]);

  const markReviewed = async (id) => {
    setReviewingId(id);
    try {
      await apiRequest(`/changes/mark-reviewed/${id}`, { method: "PATCH" });
      setChanges((prev) => prev.map((item) => (item.change_id === id ? { ...item, is_reviewed: true } : item)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <AppLayout title="Change Alerts">
      <div className="radar-card mb-6 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select className="radar-input w-40" value={type} onChange={(event) => setType(event.target.value)}>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All Types" : option}
              </option>
            ))}
          </select>
          <select
            className="radar-input w-44"
            value={competitorId}
            onChange={(event) => setCompetitorId(event.target.value)}
          >
            <option value="all">All Competitors</option>
            {competitors.map((comp) => (
              <option key={comp.competitor_id} value={comp.competitor_id}>
                {comp.company_name}
              </option>
            ))}
          </select>
          <button type="button" className={`radar-button-ghost ${highImpact ? "border-radar-danger" : ""}`} onClick={() => setHighImpact((prev) => !prev)}>
            High Impact Only
          </button>
          <button type="button" className={`radar-button-ghost ${unreviewedOnly ? "border-radar-primary" : ""}`} onClick={() => setUnreviewedOnly((prev) => !prev)}>
            Unreviewed Only
          </button>
          <select className="radar-input w-40" value={sort} onChange={(event) => setSort(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                Sort: {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState error={error} onRetry={loadChanges} />}

      {!loading && !error && filteredChanges.length === 0 && (
        <EmptyState title="No change alerts" description="Try adjusting your filters or run a new scrape." />
      )}

      {!loading && !error && filteredChanges.length > 0 && (
        <div className="space-y-4">
          {filteredChanges.map((change) => (
            <div
              key={change.change_id}
              className={`radar-card p-6 transition ${
                change.is_reviewed === "true" || change.is_reviewed === true ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge className={changeTypeColor(change.change_type)}>
                    {change.change_type?.toUpperCase() || "CHANGE"}
                  </Badge>
                  <Badge className={impactAlertColor(change.impact_score)}>Impact: {change.impact_score}/10</Badge>
                </div>
                <p className="text-xs text-radar-muted">{formatDate(change.detected_at)}</p>
              </div>
              <div className="mt-3 text-sm">
                <p className="font-semibold text-radar-text">
                  {change.competitor_name || competitorMap[change.competitor_id] || "Competitor"}
                </p>
                <a href={change.url} target="_blank" rel="noreferrer" className="text-xs text-radar-muted hover:text-radar-text">
                  {change.url}
                </a>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <p>
                  <span className="text-radar-muted">Before:</span> {change.previous_value || "-"}
                </p>
                <p>
                  <span className="text-radar-muted">After:</span> {change.new_value || "-"}
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-700">AI Summary: {change.summary}</p>
              <div className="mt-4 flex justify-end">
                {change.is_reviewed === "true" || change.is_reviewed === true ? (
                  <span className="text-xs text-radar-muted">Reviewed</span>
                ) : (
                  <button
                    type="button"
                    className="radar-button-primary"
                    onClick={() => markReviewed(change.change_id)}
                    disabled={reviewingId === change.change_id}
                  >
                    {reviewingId === change.change_id ? "Reviewing..." : "Mark Reviewed"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default ChangesPage;
