import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppLayout } from "../components/AppLayout.jsx";
import { SkeletonLine } from "../components/Skeleton.jsx";
import { EmptyState, ErrorState } from "../components/States.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { apiRequest } from "../utils/api.js";
import { formatDate } from "../utils/format.js";

const periods = [7, 30, 90];

const ReportsPage = () => {
  const [competitors, setCompetitors] = useState([]);
  const [form, setForm] = useState({
    company_name: "",
    industry: "",
    period_days: 30,
    competitor_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const toast = useToast();

  const loadCompetitors = async () => {
    try {
      const res = await apiRequest("/competitor/list");
      setCompetitors(res.competitors || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

  useEffect(() => {
    if (!loading) return undefined;
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [loading]);

  const handleGenerate = async () => {
    if (!form.company_name.trim()) {
      toast.error("Company name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setElapsed(0);
    try {
      const res = await apiRequest("/report/generate", {
        method: "POST",
        body: JSON.stringify({
          company_name: form.company_name,
          industry: form.industry,
          competitor_ids: form.competitor_ids,
          period_days: form.period_days
        })
      });
      setReport(res.report || res);
      toast.success("Report generated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!report?.content) return;
    await navigator.clipboard.writeText(report.content);
    toast.success("Report copied to clipboard.");
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedCount = form.competitor_ids.length;

  return (
    <AppLayout title="Reports">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="radar-card p-6">
          <h3 className="text-lg font-semibold">Generate New Report</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-radar-muted">Your Company Name</label>
              <input
                className="radar-input mt-1"
                value={form.company_name}
                onChange={(event) => setForm((prev) => ({ ...prev, company_name: event.target.value }))}
                placeholder="My Startup"
              />
            </div>
            <div>
              <label className="text-xs text-radar-muted">Industry</label>
              <input
                className="radar-input mt-1"
                value={form.industry}
                onChange={(event) => setForm((prev) => ({ ...prev, industry: event.target.value }))}
                placeholder="SaaS"
              />
            </div>
            <div>
              <label className="text-xs text-radar-muted">Period</label>
              <div className="mt-2 flex gap-2">
                {periods.map((period) => (
                  <button
                    key={period}
                    type="button"
                    className={`radar-button-ghost ${form.period_days === period ? "border-radar-primary" : ""}`}
                    onClick={() => setForm((prev) => ({ ...prev, period_days: period }))}
                  >
                    {period} days
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-radar-muted">Competitors</label>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {competitors.map((comp) => (
                  <label key={comp.competitor_id} className="flex items-center gap-2 rounded-xl border border-radar-border px-3 py-2 text-xs">
                    <input
                      type="checkbox"
                      checked={form.competitor_ids.includes(comp.competitor_id)}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          competitor_ids: event.target.checked
                            ? [...prev.competitor_ids, comp.competitor_id]
                            : prev.competitor_ids.filter((id) => id !== comp.competitor_id)
                        }))
                      }
                    />
                    {comp.company_name}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-radar-muted">Selected: {selectedCount}</p>
            </div>
            <button type="button" className="radar-button-primary w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        <div className="radar-card p-6 printable">
          <h3 className="text-lg font-semibold text-slate-900">Intelligence Report</h3>
          {loading && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-600">AI is generating your report... {elapsed}s</p>
              <SkeletonLine className="h-4" />
              <SkeletonLine className="h-4" />
              <SkeletonLine className="h-4" />
            </div>
          )}

          {!loading && error && <ErrorState error={error} onRetry={handleGenerate} />}

          {!loading && !report && !error && (
            <EmptyState title="No report yet" description="Generate a report to see AI insights here." />
          )}

          {!loading && report && (
            <div className="mt-4">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <span>Generated: {formatDate(report.generated_at)}</span>
                <span>{report.period_days} days</span>
                <span>{report.competitors_analyzed} competitors</span>
              </div>
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-content">
                {report.content || "No content provided."}
              </ReactMarkdown>
              <div className="mt-6 flex gap-3 print-hidden">
                <button type="button" className="radar-button-primary" onClick={handleCopy}>
                  Copy
                </button>
                <button type="button" className="radar-button-ghost" onClick={handlePrint}>
                  Print
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
