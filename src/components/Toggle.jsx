export const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    className={`relative h-7 w-14 rounded-full border border-radar-border transition ${
      enabled ? "bg-radar-primary/80" : "bg-slate-700"
    }`}
    onClick={() => onChange(!enabled)}
  >
    <span
      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
        enabled ? "translate-x-7" : "translate-x-1"
      }`}
    />
  </button>
);
