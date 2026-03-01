export const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onChange(tab)}
        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
          active === tab
            ? "border-radar-primary bg-radar-primary/15 text-radar-text"
            : "border-radar-border text-radar-muted hover:border-radar-primary/40 hover:text-radar-text"
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);
