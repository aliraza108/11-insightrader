import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppLayout } from "../components/AppLayout.jsx";
import { SkeletonCard, SkeletonLine } from "../components/Skeleton.jsx";
import { Tabs } from "../components/Tabs.jsx";
import { EmptyState, ErrorState } from "../components/States.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { apiRequest } from "../utils/api.js";

const ComparePage = () => {
  const [competitors, setCompetitors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeTab, setActiveTab] = useState("AI Analysis");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [features, setFeatures] = useState(null);
  const [error, setError] = useState(null);
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

  const handleCompare = async () => {
    if (selected.length < 2) {
      toast.error("Select at least two competitors.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/compare/competitors", {
        method: "POST",
        body: JSON.stringify({
          competitor_ids: selected,
          run_ai_analysis: true
        })
      });
      setResults(res);
      const ids = selected.join(",");
      const [pricingRes, featuresRes] = await Promise.all([
        apiRequest(`/compare/pricing?competitor_ids=${ids}`),
        apiRequest(`/compare/features?competitor_ids=${ids}`)
      ]);
      setPricing(pricingRes);
      setFeatures(featuresRes);
      setActiveTab("AI Analysis");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Compare">
      <div className="radar-card p-6">
        <h3 className="text-lg font-semibold">Select competitors to compare</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {competitors.map((comp) => (
            <label key={comp.competitor_id} className="flex items-center gap-3 rounded-xl border border-radar-border p-3 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(comp.competitor_id)}
                onChange={(event) => {
                  setSelected((prev) =>
                    event.target.checked
                      ? [...prev, comp.competitor_id]
                      : prev.filter((id) => id !== comp.competitor_id)
                  );
                }}
              />
              <span>{comp.company_name}</span>
            </label>
          ))}
        </div>
        <button type="button" className="radar-button-primary mt-4" onClick={handleCompare}>
          Compare Selected
        </button>
      </div>

      {loading && (
        <div className="mt-6 radar-card p-6">
          <p className="text-sm text-radar-muted">AI is analyzing competitors...</p>
          <div className="mt-4 space-y-3">
            <SkeletonLine className="h-4" />
            <SkeletonLine className="h-4" />
            <SkeletonLine className="h-4" />
          </div>
        </div>
      )}

      {!loading && error && <ErrorState error={error} onRetry={handleCompare} />}

      {!loading && results && (
        <div className="mt-6 space-y-4">
          <Tabs tabs={["AI Analysis", "Pricing", "Features"]} active={activeTab} onChange={setActiveTab} />

          {activeTab === "AI Analysis" && (
            <div className="radar-card p-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-content">
                {results.ai_analysis || "No AI analysis available."}
              </ReactMarkdown>
            </div>
          )}

          {activeTab === "Pricing" && (
            <div className="radar-card p-6">
              {!pricing ? (
                <SkeletonCard />
              ) : pricing.metrics?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="text-[11px] uppercase text-radar-muted">
                      <tr>
                        <th className="pb-2">Metric</th>
                        {pricing.competitors?.map((comp) => (
                          <th key={comp.id || comp.name} className="pb-2">
                            {comp.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(pricing.metrics || []).map((metric) => (
                        <tr key={metric.label} className="border-t border-radar-border">
                          <td className="py-2 font-semibold text-radar-text">{metric.label}</td>
                          {metric.values.map((value, idx) => (
                            <td key={`${metric.label}-${idx}`} className="py-2">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-radar-muted">No pricing data returned.</p>
              )}
            </div>
          )}

          {activeTab === "Features" && (
            <div className="radar-card p-6">
              {!features ? (
                <SkeletonCard />
              ) : features.matrix?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="text-[11px] uppercase text-radar-muted">
                      <tr>
                        <th className="pb-2">Feature</th>
                        {features.competitors?.map((comp) => (
                          <th key={comp.id || comp.name} className="pb-2">
                            {comp.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(features.matrix || []).map((row) => (
                        <tr key={row.feature} className="border-t border-radar-border">
                          <td className="py-2 font-semibold text-radar-text">{row.feature}</td>
                          {row.values.map((value, idx) => (
                            <td key={`${row.feature}-${idx}`} className="py-2">
                              {value ? "Yes" : "No"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-radar-muted">No feature data returned.</p>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !results && competitors.length === 0 && (
        <EmptyState title="No competitors" description="Add competitors to compare them." />
      )}
    </AppLayout>
  );
};

export default ComparePage;
