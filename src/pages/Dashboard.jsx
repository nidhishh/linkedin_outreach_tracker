import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertCircle, CalendarClock, Sparkles, Trash2 } from "lucide-react";
import { useContacts } from "../lib/ContactsContext";
import { followUpUrgency, formatRelative } from "../lib/dateUtils";
import { STAGE_MAP } from "../lib/stages";
import StatCard from "../components/StatCard";
import StageBadge from "../components/StageBadge";
import EmptyState from "../components/EmptyState";
import ContactFormModal from "../components/ContactFormModal";
import ExtensionBanner from "../components/ExtensionBanner";

export default function Dashboard() {
  const { contacts, loading, removeContact } = useContacts();
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
        <ExtensionBanner />
        <EmptyState
          icon={Sparkles}
          title="Your rolodex is empty"
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
      <ExtensionBanner />

      <div className="grid grid-cols-4 gap-4 mb-8">
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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="font-display text-lg text-ink mb-3">
            Follow-up queue
          </h2>
          {followUpQueue.length === 0 ? (
            <div className="text-sm text-ink-soft border border-dashed border-line rounded-card px-5 py-8 text-center">
              Nothing due. You're caught up.
            </div>
          ) : (
            <div className="border border-line rounded-card overflow-hidden bg-surface shadow-card">
              {followUpQueue.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/contacts/${c.id}`)}
                  className={`w-full flex items-center justify-between text-left px-5 py-3.5 hover:bg-paper/50 transition-colors ${
                    i !== 0 ? "border-t border-line" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-display text-[15px] text-ink truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-ink-soft mt-0.5 truncate">
                      {[c.title, c.company].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <StageBadge stageId={c.stage} />
                    <UrgencyPill date={c.nextFollowUpDate} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

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
                  onClick={(e) => {
                    e.stopPropagation();
                    removeContact(c.id);
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
