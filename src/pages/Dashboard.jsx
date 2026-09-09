import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  AlertCircle,
  CalendarClock,
  Sparkles,
  Trash2,
  Send,
  MessageCircle,
  CalendarCheck,
  Trophy,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useContacts } from "../lib/ContactsContext";
import { followUpUrgency, formatRelative } from "../lib/dateUtils";
import { STAGE_MAP } from "../lib/stages";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import ContactFormModal from "../components/ContactFormModal";

export default function Dashboard() {
  const {
    contacts,
    loading,
    removeContact,
    quickBumpFollowUp,
    markFollowedUp,
    showToast,
  } = useContacts();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);

  const active = contacts.filter((c) => c.stage !== "archived");

  const overdue = active.filter(
    (c) => followUpUrgency(c.nextFollowUpDate) === "overdue"
  );
  const dueToday = active.filter(
    (c) => followUpUrgency(c.nextFollowUpDate) === "today"
  );
  const dueSoon = active.filter(
    (c) => followUpUrgency(c.nextFollowUpDate) === "soon"
  );

  const messagesSent = active.filter((c) => c.stage === "message_sent");
  const inConversation = active.filter((c) => c.stage === "in_conversation" || c.stage === "follow_up_needed");
  const meetingsScheduled = active.filter((c) => c.stage === "meeting_scheduled");
  const converted = active.filter((c) => c.stage === "converted");

  const followUpQueue = useMemo(
    () =>
      [...overdue, ...dueToday, ...dueSoon].sort((a, b) =>
        (a.nextFollowUpDate || "") < (b.nextFollowUpDate || "") ? -1 : 1
      ),
    [overdue, dueToday, dueSoon]
  );

  const recentlyAdded = [...contacts]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  if (loading) return null;

  if (contacts.length === 0) {
    return (
      <div className="max-w-5xl">
        <PageHeader />
        <EmptyState
          icon={Sparkles}
          title="Your LOCK-IN-NIGGA is empty"
          description="Add the first person you've reached out to on LinkedIn to start tracking the conversation."
          action={
            <button
              onClick={() => setFormOpen(true)}
              className="bg-brass hover:bg-brass-light text-ink font-medium text-sm px-4 py-2.5 rounded-sm transition-colors"
            >
              Add your first contact
            </button>
          }
        />
        <ContactFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <PageHeader />

      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard label="Active contacts" value={active.length} icon={Users} />
        <StatCard
          label="Overdue"
          value={overdue.length}
          tone="rust"
          icon={AlertCircle}
        />
        <StatCard
          label="Due today"
          value={dueToday.length}
          tone="brass"
          icon={CalendarClock}
        />
        <StatCard
          label="Due this week"
          value={dueSoon.length}
          tone="teal"
          icon={CalendarClock}
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Messages Sent" 
          value={messagesSent.length} 
          icon={Send} 
        />
        <StatCard
          label="In Conversation"
          value={inConversation.length}
          tone="teal"
          icon={MessageCircle}
        />
        <StatCard
          label="Meetings Booked"
          value={meetingsScheduled.length}
          tone="brass"
          icon={CalendarCheck}
        />
        <StatCard
          label="Converted"
          value={converted.length}
          tone="sage"
          icon={Trophy}
        />
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Follow-up Queue Command Center */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-ink">
              Follow-up queue
            </h2>
            <span className="text-xs font-mono text-ink-faint">
              {followUpQueue.length} pending action
            </span>
          </div>

          {followUpQueue.length === 0 ? (
            <div className="text-sm text-ink-soft border border-dashed border-line rounded-card px-5 py-8 text-center bg-surface">
              🎉 Nothing due! You're completely caught up on your outreach.
            </div>
          ) : (
            <div className="border border-line rounded-card overflow-hidden bg-surface shadow-card divide-y divide-line">
              {followUpQueue.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/contacts/${c.id}`)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-paper/40 transition-colors cursor-pointer gap-3"
                >
                  {/* Contact Info & Cadence */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-[15px] text-ink truncate">
                        {c.name}
                      </p>
                      {/* Cadence badge shows which follow-up attempt this is */}
                      {c.followUpCount > 0 ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-brass/15 text-brass-dark font-medium flex items-center gap-0.5">
                          <Clock size={10} />
                          #{c.followUpCount} nudge
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-ink-faint">1st Outreach</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5 truncate">
                      {[c.title, c.company].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>

                  {/* Badges & Quick Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <UrgencyPill date={c.nextFollowUpDate} />
                    
                    {/* 1-Click Action: Mark Followed Up & auto-schedule next check-in */}
                    <button
                      type="button"
                      title="Log follow-up sent today and schedule next in 4 days"
                      onClick={() => markFollowedUp(c.id, 4)}
                      className="text-xs font-medium bg-brass/15 hover:bg-brass/25 text-brass-dark border border-brass/30 px-2 py-1 rounded-sm flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={12} />
                      Sent Nudge (+4d)
                    </button>

                    {/* Quick Reschedule Bump +3d */}
                    <button
                      type="button"
                      title="Reschedule follow-up +3 days from today"
                      onClick={() => quickBumpFollowUp(c.id, 3)}
                      className="text-[10px] font-mono px-1.5 py-1 rounded border border-line hover:border-brass hover:bg-brass/10 hover:text-ink transition-colors"
                    >
                      +3d
                    </button>

                    {/* Quick Reschedule Bump +1w */}
                    <button
                      type="button"
                      title="Reschedule follow-up +1 week from today"
                      onClick={() => quickBumpFollowUp(c.id, 7)}
                      className="text-[10px] font-mono px-1.5 py-1 rounded border border-line hover:border-brass hover:bg-brass/10 hover:text-ink transition-colors"
                    >
                      +1w
                    </button>

                    {/* Quick Trash Deletion */}
                    <button
                      type="button"
                      title="Delete contact"
                      onClick={() => {
                        const confirmed = window.confirm(`Are you sure you want to delete ${c.name}?`);
                        if (confirmed) {
                          removeContact(c.id);
                          showToast(`Deleted ${c.name}`);
                        }
                      }}
                      className="p-1 rounded text-ink-faint hover:text-rust hover:bg-rust/10 transition-colors ml-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Added Sidebar */}
        <div>
          <h2 className="font-display text-lg text-ink mb-3">
            Recently added
          </h2>
          <div className="border border-line rounded-card overflow-hidden bg-surface shadow-card">
            {recentlyAdded.map((c, i) => (
              <div
                key={c.id}
                onClick={() => navigate(`/contacts/${c.id}`)}
                className={`w-full flex items-center justify-between text-left px-4 py-3 hover:bg-paper/50 transition-colors group cursor-pointer ${
                  i !== 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-sm text-ink font-medium truncate">
                    {c.name}
                  </p>
                  <p className="text-[11px] font-mono text-ink-faint mt-0.5">
                    {STAGE_MAP[c.stage]?.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const confirmed = window.confirm(`Are you sure you want to delete ${c.name}?`);
                    if (confirmed) {
                      removeContact(c.id);
                      showToast(`Deleted ${c.name}`);
                    }
                  }}
                  title="Delete entry"
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rust/15 text-ink-soft hover:text-rust rounded transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="mb-7">
      <p className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-1">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
    </div>
  );
}

function UrgencyPill({ date }) {
  const urgency = followUpUrgency(date);
  const styles = {
    overdue: "bg-rust/10 text-rust",
    today: "bg-brass/15 text-brass-dark",
    soon: "bg-teal/10 text-teal-dark",
  };
  return (
    <span
      className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${styles[urgency] || ""}`}
    >
      {formatRelative(date)}
    </span>
  );
}
