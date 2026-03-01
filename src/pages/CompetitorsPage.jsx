import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout.jsx";
import { Avatar } from "../components/Avatar.jsx";
import { Drawer } from "../components/Drawer.jsx";
import { Modal } from "../components/Modal.jsx";
import { SkeletonCard } from "../components/Skeleton.jsx";
import { EmptyState, ErrorState } from "../components/States.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { apiRequest } from "../utils/api.js";
import { formatDate } from "../utils/format.js";

const defaultForm = {
  company_name: "",
  industry: "",
  target_market: "",
  tracking_urls: [""],
  monitoring_frequency: "daily",
  keywords: []
};

const CompetitorsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/competitor/list");
      setData(res.competitors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const urlsValid = useMemo(() => form.tracking_urls.some((url) => url.trim().length > 0), [form.tracking_urls]);

  const handleAddUrl = () => {
    setForm((prev) => ({ ...prev, tracking_urls: [...prev.tracking_urls, ""] }));
  };

  const handleRemoveUrl = (index) => {
    setForm((prev) => ({
      ...prev,
      tracking_urls: prev.tracking_urls.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.company_name.trim() || !urlsValid) {
      toast.error("Company name and at least one tracking URL are required.");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/competitor/add", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          tracking_urls: form.tracking_urls.filter((url) => url.trim().length > 0)
        })
      });
      toast.success("Competitor added successfully.");
      setDrawerOpen(false);
      setForm(defaultForm);
      setKeywordInput("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await apiRequest(`/competitor/remove/${confirm.competitor_id}`, {
        method: "DELETE"
      });
      toast.success("Competitor removed.");
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleKeywordAdd = (event) => {
    if (event.key === "Enter" && keywordInput.trim()) {
      event.preventDefault();
      setForm((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput("");
    }
  };

  return (
    <AppLayout title="Competitors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-radar-muted">Track and manage your competitors.</p>
        </div>
        <button type="button" className="radar-button-primary" onClick={() => setDrawerOpen(true)}>
          Add Competitor
        </button>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        )}

        {!loading && error && <ErrorState error={error} onRetry={load} />}

        {!loading && !error && data.length === 0 && (
          <EmptyState
            title="No competitors yet"
            description="Add your first competitor to start tracking changes."
            action={
              <button type="button" className="radar-button-primary" onClick={() => setDrawerOpen(true)}>
                Add Competitor
              </button>
            }
          />
        )}

        {!loading && data.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {data.map((comp) => (
              <div key={comp.competitor_id} className="radar-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={comp.company_name} />
                    <div>
                      <p className="text-lg font-semibold">{comp.company_name}</p>
                      <p className="text-xs text-radar-muted">Industry: {comp.industry || "-"}</p>
                      <p className="text-xs text-radar-muted">Market: {comp.target_market || "-"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="radar-button-ghost"
                      onClick={() => navigate("/scrape", { state: { competitorId: comp.competitor_id } })}
                    >
                      Scrape
                    </button>
                    <button type="button" className="radar-button-ghost" onClick={() => setConfirm(comp)}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>Frequency: {comp.monitoring_frequency}</p>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-radar-muted">Tracking URLs</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      {comp.tracking_urls?.map((url) => (
                        <li key={url}>
                          <a href={url} target="_blank" rel="noreferrer" className="hover:text-radar-text">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-radar-muted">Keywords</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {comp.keywords?.length ? (
                        comp.keywords.map((keyword) => (
                          <span key={keyword} className="radar-badge bg-black/5 text-slate-700">
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-radar-muted">None</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-radar-muted">Added: {formatDate(comp.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={drawerOpen} title="Add Competitor" onClose={() => setDrawerOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-radar-muted">Company Name</label>
            <input
              className="radar-input mt-1"
              value={form.company_name}
              onChange={(event) => setForm((prev) => ({ ...prev, company_name: event.target.value }))}
              placeholder="Notion"
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
            <label className="text-xs text-radar-muted">Target Market</label>
            <input
              className="radar-input mt-1"
              value={form.target_market}
              onChange={(event) => setForm((prev) => ({ ...prev, target_market: event.target.value }))}
              placeholder="Teams"
            />
          </div>
          <div>
            <label className="text-xs text-radar-muted">Tracking URLs</label>
            <div className="mt-2 space-y-2">
              {form.tracking_urls.map((url, index) => (
                <div key={`url-${index}`} className="flex gap-2">
                  <input
                    className="radar-input"
                    value={url}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        tracking_urls: prev.tracking_urls.map((item, idx) => (idx === index ? event.target.value : item))
                      }))
                    }
                    placeholder="https://competitor.com/pricing"
                  />
                  {form.tracking_urls.length > 1 && (
                    <button type="button" className="radar-button-ghost" onClick={() => handleRemoveUrl(index)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="radar-button-ghost" onClick={handleAddUrl}>
                Add URL
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-radar-muted">Monitoring</label>
            <select
              className="radar-input mt-1"
              value={form.monitoring_frequency}
              onChange={(event) => setForm((prev) => ({ ...prev, monitoring_frequency: event.target.value }))}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-radar-muted">Keywords</label>
            <input
              className="radar-input mt-1"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={handleKeywordAdd}
              placeholder="Press Enter to add"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {form.keywords.map((keyword) => (
                <button
                  type="button"
                  key={keyword}
                  className="radar-badge bg-black/5 text-slate-700"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      keywords: prev.keywords.filter((item) => item !== keyword)
                    }))
                  }
                >
                  {keyword} x
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="radar-button-ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </button>
            <button type="button" className="radar-button-primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Adding..." : "Add Competitor"}
            </button>
          </div>
        </div>
      </Drawer>

      <Modal
        open={Boolean(confirm)}
        title="Remove competitor"
        onClose={() => setConfirm(null)}
        actions={
          <>
            <button type="button" className="radar-button-ghost" onClick={() => setConfirm(null)} disabled={deleting}>
              Cancel
            </button>
            <button type="button" className="radar-button-primary" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </>
        }
      >
        This will permanently remove {confirm?.company_name}. Continue?
      </Modal>
    </AppLayout>
  );
};

export default CompetitorsPage;
