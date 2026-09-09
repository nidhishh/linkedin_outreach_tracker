import { useNavigate } from "react-router-dom";
import { STAGE_MAP } from "../lib/stages";
import { lastInteractionDate } from "../lib/storage";
import { useContacts } from "../lib/ContactsContext";
import FollowUpBadge from "./FollowUpBadge";
import { Building2, Trash2, Clock } from "lucide-react";

export default function ContactCard({ contact, draggable, onDragStart, onDragEnd }) {
  const navigate = useNavigate();
  // Access global contacts state actions for rescheduling and manual deletion
  const { quickBumpFollowUp, removeContact, showToast } = useContacts();
  const stage = STAGE_MAP[contact.stage];

  // Handles manual deletion with user confirmation prompt
  const handleDelete = (e) => {
    // Crucial: stop propagation so card click does not trigger navigation to /contacts/:id
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete ${contact.name || "this contact"}?`);
    if (confirmed) {
      removeContact(contact.id);
      showToast(`Deleted ${contact.name || "contact"}`);
    }
  };

  // Handles 1-click follow-up reschedule (+N days from today)
  const handleBump = (e, days) => {
    // Prevent navigating to detail page on button click
    e.stopPropagation();
    quickBumpFollowUp(contact.id, days);
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => navigate(`/contacts/${contact.id}`)}
      className="group relative bg-surface border border-line rounded-card shadow-card hover:shadow-cardHover transition-shadow cursor-pointer px-4 pt-5 pb-3.5 mb-3"
    >
      {/* Top stage accent pill */}
      <span
        className="absolute -top-[9px] left-[18px] w-[34px] h-[12px] rounded-t-[3px]"
        style={{ backgroundColor: stage?.dot, opacity: 0.85 }}
        aria-hidden="true"
      />

      {/* Header: Contact Name and Hover Action Icons */}
      <div className="flex items-start justify-between gap-1">
        <h3 className="font-display text-[15px] leading-snug text-ink pr-1">
          {contact.name || "Untitled contact"}
        </h3>
        
        {/* Quick actions visible on card hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 -mt-1 -mr-1">
          <button
            type="button"
            title="Delete contact"
            onClick={handleDelete}
            className="p-1 rounded text-ink-faint hover:text-rust hover:bg-rust/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {(contact.title || contact.company) && (
        <p className="text-xs text-ink-soft mt-1 flex items-center gap-1">
          <Building2 size={11} strokeWidth={2} className="shrink-0" />
          <span className="truncate">
            {[contact.title, contact.company].filter(Boolean).join(" · ")}
          </span>
        </p>
      )}

      {/* Tags and Cadence badge */}
      <div className="flex flex-wrap items-center gap-1 mt-2.5">
        {/* Cadence badge: shows follow-up attempt number if already contacted */}
        {contact.followUpCount > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-brass/15 text-brass-dark font-medium flex items-center gap-0.5">
            <Clock size={10} />
            #{contact.followUpCount} nudge
          </span>
        )}

        {contact.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-ink/[0.05] text-ink-soft"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Card Footer: Activity date and Follow-up badge */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-line/70">
        <span className="text-[10px] font-mono text-ink-faint">
          {formatLast(lastInteractionDate(contact))}
        </span>
        <FollowUpBadge date={contact.nextFollowUpDate} />
      </div>

      {/* 1-Click Quick Reschedule Bumps Bar */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-line/40 text-[10px] font-mono text-ink-faint">
        <span>Reschedule:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Reschedule follow-up for 3 days from today"
            onClick={(e) => handleBump(e, 3)}
            className="px-1.5 py-0.5 rounded border border-line hover:border-brass hover:bg-brass/10 hover:text-ink transition-colors"
          >
            +3d
          </button>
          <button
            type="button"
            title="Reschedule follow-up for 1 week from today"
            onClick={(e) => handleBump(e, 7)}
            className="px-1.5 py-0.5 rounded border border-line hover:border-brass hover:bg-brass/10 hover:text-ink transition-colors"
          >
            +1w
          </button>
        </div>
      </div>
    </div>
  );
}

function formatLast(dateStr) {
  if (!dateStr) return "No activity";
  const d = new Date(dateStr + "T00:00:00");
  return `Last: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}
