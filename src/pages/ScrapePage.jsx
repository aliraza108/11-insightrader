import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "../components/AppLayout.jsx";
import { Badge } from "../components/Badge.jsx";
import { ProgressBar } from "../components/ProgressBar.jsx";
import { SkeletonLine } from "../components/Skeleton.jsx";
import { EmptyState, ErrorState } from "../components/States.jsx";
import { Toggle } from "../components/Toggle.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { apiRequest } from "../utils/api.js";
import { formatShortDate, impactColor } from "../utils/format.js";

const ScrapePage = () => {
  const [competitors, setCompetitors] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [job, setJob] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const toast = useToast();
  const location = useLocation();

  useEffect(() => {
    const preselected = location.state?.competitorId;
    if (preselected) {
      setSelectedId(preselected);
    }
  }, [location.state]);

  const loadCompetitors = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/competitor/list");
      setCompetitors(res.competitors || []);
      if (!selectedId && res.competitors?.length) {
        setSelectedId(res.competitors[0].competitor_id);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshots = async (competitorId) => {
    if (!competitorId) return;
    setSnapshotsLoading(true);
    try {
      const res = await apiRequest(`/scrape/snapshots/${competitorId}`);
      setSnapshots(res.snapshots || res || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSnapshotsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

  useEffect(() => {
    loadSnapshots(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (jobStatus?.status === "completed") {
      loadSnapshots(selectedId);
    }
  }, [jobStatus?.status, selectedId]);

  useEffect(() => {
    if (!job?.job_id) return;
    let interval;
    let active = true;

    const poll = async () => {
      try {
        const res = await apiRequest(`/scrape/status/${job.job_id}`);
        if (!active) return;
        setJobStatus(res);
        if (res.status === "completed") {
          clearInterval(interval);
        }
      } catch (err) {
        if (!active) return;
        setStatusError(err.message);
        clearInterval(interval);
      }
    };

    poll();
    interval = setInterval(poll, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [job]);

  const handleStart = async () => {
    if (!selectedId) {
      toast.error("Select a competitor first.");
      return;
    }
    setStatusError(null);
    setJobStatus(null);
    setStarting(true);
    try {
      const res = await apiRequest("/scrape/run", {
        method: "POST",
        body: JSON.stringify({
          competitor_id: selectedId,
          run_ai_analysis: aiEnabled
        })
      });
      setJob(res);
      toast.success(res.message || "Scrape started.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setStarting(false);
    }
  };

  const selectedName = useMemo(() => {
    return competitors.find((comp) => comp.competitor_id === selectedId)?.company_name || "";
  }, [competitors, selectedId]);

  return (
    <AppLayout title="Run Scrape">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="radar-card p-6">
            <h3 className="text-lg font-semibold">Run New Scrape</h3>
            {loading ? (
              <div className="mt-4 space-y-3">
                <SkeletonLine className="h-10" />
                <SkeletonLine className="h-10" />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-radar-muted">Competitor</label>
                  <select
                    className="radar-input mt-1"
                    value={selectedId}
                    onChange={(event) => setSelectedId(event.target.value)}
                  >
                    {competitors.map((comp) => (
                      <option key={comp.competitor_id} value={comp.competitor_id}>
                        {comp.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-radar-muted">AI Analysis</p>
                    <p className="text-sm">{aiEnabled ? "Enabled" : "Disabled"}</p>
                  </div>
                  <Toggle enabled={aiEnabled} onChange={setAiEnabled} />
                </div>
                <button type="button" className="radar-button-primary w-full" onClick={handleStart} disabled={starting}>
                  {starting ? "Starting..." : "Start Scrape"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="radar-card p-6">
            <h3 className="text-lg font-semibold">Job Status</h3>
            {!job && <p className="mt-4 text-sm text-radar-muted">No active job.</p>}
            {statusError && <ErrorState error={statusError} />}
            {jobStatus && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-radar-muted">Status: {jobStatus.status}</p>
                  <p className="text-sm text-white">{jobStatus.progress}%</p>
                </div>
                <ProgressBar value={jobStatus.progress} />
                <div className="space-y-3">
                  {jobStatus.results?.map((result, idx) => (
                    <div key={`${result.url}-${idx}`} className="rounded-xl border border-radar-border bg-slate-900/70 p-4">
                      <div className="flex items-center justify-between">
                        <a href={result.url} target="_blank" rel="noreferrer" className="text-sm hover:text-white">
                          {result.url}
                        </a>
                        <Badge className={impactColor(result.changes_detected || 0)}>
                          Changes: {result.changes_detected ?? 0}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-radar-muted">Status: {result.status}</div>
                      {result.ai_insight_preview && (
                        <div className="mt-3">
                          <button
                            type="button"
                            className="text-xs text-radar-primary hover:text-white"
                            onClick={() =>
                              setCollapsed((prev) => ({
                                ...prev,
                                [result.url]: !prev[result.url]
                              }))
                            }
                          >
                            {collapsed[result.url] ? "Hide" : "Show"} AI Insight
                          </button>
                          {collapsed[result.url] && (
                            <p className="mt-2 text-sm text-slate-300">{result.ai_insight_preview}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="radar-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Past Snapshots</h3>
              <p className="text-xs text-radar-muted">{selectedName}</p>
            </div>

            {snapshotsLoading && (
              <div className="space-y-3">
                <SkeletonLine className="h-4" />
                <SkeletonLine className="h-4" />
                <SkeletonLine className="h-4" />
              </div>
            )}

            {!snapshotsLoading && snapshots.length === 0 && (
              <EmptyState title="No snapshots yet" description="Run a scrape to generate snapshots." />
            )}

            {!snapshotsLoading && snapshots.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[11px] uppercase text-radar-muted">
                    <tr>
                      <th className="pb-2">URL</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Words</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshots.map((snap, idx) => (
                      <tr key={snap.snapshot_id || idx} className="border-t border-radar-border">
                        <td className="py-2">
                          <a href={snap.url} target="_blank" rel="noreferrer" className="hover:text-white">
                            {snap.url}
                          </a>
                        </td>
                        <td className="py-2">{formatShortDate(snap.created_at || snap.date)}</td>
                        <td className="py-2">{snap.title || "-"}</td>
                        <td className="py-2 font-mono">{snap.word_count || snap.words || "-"}</td>
                        <td className="py-2">{snap.status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ScrapePage;
