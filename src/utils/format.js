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
  if (score >= 8) return "bg-radar-danger/20 text-radar-danger";
  if (score >= 5) return "bg-radar-warning/20 text-radar-warning";
  return "bg-radar-accent/20 text-radar-accent";
};

export const impactAlertColor = (score) => {
  if (score >= 9) return "bg-radar-danger/20 text-radar-danger";
  if (score >= 7) return "bg-radar-warning/20 text-radar-warning";
  if (score >= 5) return "bg-yellow-500/20 text-yellow-300";
  return "bg-slate-500/20 text-slate-300";
};

export const changeTypeColor = (type) => {
  switch (type) {
    case "pricing":
      return "bg-radar-danger/20 text-radar-danger";
    case "features":
      return "bg-blue-500/20 text-blue-300";
    case "messaging":
      return "bg-purple-500/20 text-purple-300";
    case "content":
      return "bg-slate-500/20 text-slate-300";
    case "structure":
      return "bg-amber-500/20 text-amber-300";
    default:
      return "bg-slate-600/20 text-slate-300";
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
