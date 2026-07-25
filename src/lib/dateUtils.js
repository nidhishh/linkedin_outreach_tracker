// Small, dependency-free date helpers. Dates are stored as "YYYY-MM-DD" strings.

export function todayStr() {
  return toDateStr(new Date());
}

export function toDateStr(d) {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${day}`;
}

export function addDays(dateStr, days) {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(todayStr() + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}

// Returns 'overdue' | 'today' | 'soon' | 'later' | null
export function followUpUrgency(dateStr) {
  if (!dateStr) return null;
  const diff = daysUntil(dateStr);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 7) return "soon";
  return "later";
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRelative(dateStr) {
  if (!dateStr) return "—";
  const diff = daysUntil(dateStr);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff <= 7) return `In ${diff}d`;
  return formatDateShort(dateStr);
}
