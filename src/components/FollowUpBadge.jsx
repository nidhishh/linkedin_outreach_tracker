import { followUpUrgency, formatRelative } from "../lib/dateUtils";
import { Clock, AlertCircle } from "lucide-react";

const STYLES = {
  overdue: "bg-rust/10 text-rust",
  today: "bg-brass/15 text-brass-dark",
  soon: "bg-teal/10 text-teal-dark",
  later: "bg-ink/[0.05] text-ink-soft",
};

export default function FollowUpBadge({ date }) {
  const urgency = followUpUrgency(date);
  if (!urgency) return null;

  const Icon = urgency === "overdue" ? AlertCircle : Clock;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono text-[10px] px-2 py-0.5 ${STYLES[urgency]}`}
    >
      <Icon size={11} strokeWidth={2} />
      {formatRelative(date)}
    </span>
  );
}
