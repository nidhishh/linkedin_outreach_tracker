import { useNavigate } from "react-router-dom";
import { STAGE_MAP } from "../lib/stages";
import { lastInteractionDate } from "../lib/storage";
import FollowUpBadge from "./FollowUpBadge";
import { Building2 } from "lucide-react";

export default function ContactCard({ contact, draggable, onDragStart, onDragEnd }) {
  const navigate = useNavigate();
  const stage = STAGE_MAP[contact.stage];

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => navigate(`/contacts/${contact.id}`)}
      className="group relative bg-surface border border-line rounded-card shadow-card hover:shadow-cardHover transition-shadow cursor-pointer px-4 pt-5 pb-4 mb-3"
    >
      <span
        className="absolute -top-[9px] left-[18px] w-[34px] h-[12px] rounded-t-[3px]"
        style={{ backgroundColor: stage?.dot, opacity: 0.85 }}
        aria-hidden="true"
      />
      <h3 className="font-display text-[15px] leading-snug text-ink pr-1">
        {contact.name || "Untitled contact"}
      </h3>
      {(contact.title || contact.company) && (
        <p className="text-xs text-ink-soft mt-1 flex items-center gap-1">
          <Building2 size={11} strokeWidth={2} className="shrink-0" />
          <span className="truncate">
            {[contact.title, contact.company].filter(Boolean).join(" · ")}
          </span>
        </p>
      )}

      {contact.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {contact.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-ink/[0.05] text-ink-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-line/70">
        <span className="text-[10px] font-mono text-ink-faint">
          {formatLast(lastInteractionDate(contact))}
        </span>
        <FollowUpBadge date={contact.nextFollowUpDate} />
      </div>
    </div>
  );
}

function formatLast(dateStr) {
  if (!dateStr) return "No activity";
  const d = new Date(dateStr + "T00:00:00");
  return `Last: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}
