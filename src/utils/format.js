export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

export const formatShortDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("en-US");
};

export const impactColor = (score) => {
  if (score >= 8) return "bg-radar-danger/15 text-radar-danger";
  if (score >= 5) return "bg-radar-warning/15 text-radar-warning";
  return "bg-radar-accent/15 text-radar-accent";
};

export const impactAlertColor = (score) => {
  if (score >= 9) return "bg-radar-danger/15 text-radar-danger";
  if (score >= 7) return "bg-radar-warning/15 text-radar-warning";
  if (score >= 5) return "bg-amber-200 text-amber-900";
  return "bg-slate-200 text-slate-700";
};

export const changeTypeColor = (type) => {
  switch (type) {
    case "pricing":
      return "bg-radar-danger/15 text-radar-danger";
    case "features":
      return "bg-radar-primary/15 text-radar-primary";
    case "messaging":
      return "bg-amber-200 text-amber-900";
    case "content":
      return "bg-slate-200 text-slate-700";
    case "structure":
      return "bg-radar-warning/15 text-radar-warning";
    default:
      return "bg-slate-200 text-slate-700";
  }
};

export const hashColor = (name) => {
  if (!name) return "bg-slate-600";
  const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-rose-500"];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
