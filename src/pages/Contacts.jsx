import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Rows3, Trash2, Clock } from "lucide-react";
import { useContacts } from "../lib/ContactsContext";
import { STAGES } from "../lib/stages";
import { lastInteractionDate } from "../lib/storage";
import StageBadge from "../components/StageBadge";
import FollowUpBadge from "../components/FollowUpBadge";
import EmptyState from "../components/EmptyState";

const SORTS = {
  recent: { label: "Last activity", fn: (a, b) => (lastInteractionDate(a) || "") < (lastInteractionDate(b) || "") ? 1 : -1 },
  name: { label: "Name (A–Z)", fn: (a, b) => a.name.localeCompare(b.name) },
  followup: { label: "Follow-up date", fn: (a, b) => (a.nextFollowUpDate || "9999") < (b.nextFollowUpDate || "9999") ? -1 : 1 },
};

export default function Contacts() {
  const { contacts, removeContact, removeMultipleContacts, quickBumpFollowUp, showToast } = useContacts();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortKey, setSortKey] = useState("recent");
  
  // Track selected contact IDs for manual batch deletion
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filtered = useMemo(() => {
    let list = contacts;
    if (stageFilter !== "all") {
      list = list.filter((c) => c.stage === stageFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) =>
        [c.name, c.company, c.title, ...(c.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return [...list].sort(SORTS[sortKey].fn);
  }, [contacts, query, stageFilter, sortKey]);

  // Toggle selection for a single contact row
  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle selection for all currently visible/filtered contacts
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  // Manual batch delete handler with confirmation prompt
  const handleBatchDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    const confirmed = window.confirm(`Are you sure you want to permanently delete ${count} selected contacts?`);
    if (confirmed) {
      await removeMultipleContacts([...selectedIds]);
      setSelectedIds(new Set());
    }
  };

  // Single row delete handler
  const handleDeleteRow = (c, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Delete ${c.name || "this contact"}?`);
    if (confirmed) {
      removeContact(c.id);
      showToast(`Deleted ${c.name || "contact"}`);
      // Remove from selected set if it was selected
      if (selectedIds.has(c.id)) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(c.id);
          return next;
        });
      }
    }
  };

  // 1-Click quick bump (+3d / +1w) from table row
  const handleQuickBump = (c, days, e) => {
    e.stopPropagation();
    quickBumpFollowUp(c.id, days);
  };

  if (contacts.length === 0) {
    return (
      <div className="max-w-5xl">
        <Header />
        <EmptyState
          icon={Rows3}
          title="No contacts yet"
          description="Everyone you add will show up here as a searchable, filterable list."
        />
      </div>
    );
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  return (
    <div>
      <Header />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, company, tag…"
            className="w-full bg-surface border border-line rounded-sm pl-8 pr-3 py-2 text-sm placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brass focus:border-brass"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="bg-surface border border-line rounded-sm px-3 py-2 text-sm text-ink-soft focus:outline-none focus:ring-1 focus:ring-brass"
        >
          <option value="all">All stages</option>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="bg-surface border border-line rounded-sm pl-3 pr-3 py-2 text-sm text-ink-soft focus:outline-none focus:ring-1 focus:ring-brass"
        >
          {Object.entries(SORTS).map(([key, { label }]) => (
            <option key={key} value={key}>
              Sort: {label}
            </option>
          ))}
        </select>

        {/* Bulk Action Bar: Shown when one or more rows are checked */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-rust/10 border border-rust/30 px-3 py-1.5 rounded-sm animate-fade-in">
            <span className="text-xs font-mono font-medium text-rust">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="flex items-center gap-1 text-xs font-medium bg-rust text-surface px-2.5 py-1 rounded-sm hover:opacity-90 transition-opacity"
            >
              <Trash2 size={12} />
              Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-ink-soft hover:text-ink ml-1"
            >
              Cancel
            </button>
          </div>
        )}

        <span className="text-xs font-mono text-ink-faint ml-auto">
          {filtered.length} of {contacts.length}
        </span>
      </div>

      {/* Contacts Table */}
      <div className="border border-line rounded-card overflow-hidden bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper/40 text-left">
              {/* Checkbox column header */}
              <th className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-line text-brass focus:ring-brass cursor-pointer"
                  title={allSelected ? "Deselect all" : "Select all"}
                />
              </th>
              <Th>Name</Th>
              <Th>Company</Th>
              <Th>Stage</Th>
              <Th>Cadence</Th>
              <Th>Next Follow-Up</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const isSelected = selectedIds.has(c.id);
              return (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/contacts/${c.id}`)}
                  className={`border-b border-line last:border-b-0 hover:bg-paper/40 cursor-pointer transition-colors ${
                    isSelected ? "bg-brass/5" : ""
                  }`}
                >
                  {/* Row Checkbox for batch selection */}
                  <td className="w-10 px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelect(c.id, e)}
                      className="rounded border-line text-brass focus:ring-brass cursor-pointer"
                    />
                  </td>

                  {/* Name and headline */}
                  <td className="px-4 py-3">
                    <p className="font-display text-[15px] text-ink">{c.name}</p>
                    <p className="text-xs text-ink-soft">{c.title || "—"}</p>
                  </td>

                  <td className="px-4 py-3 text-ink-soft">{c.company || "—"}</td>

                  <td className="px-4 py-3">
                    <StageBadge stageId={c.stage} />
                  </td>

                  {/* Cadence: follow up count */}
                  <td className="px-4 py-3">
                    {c.followUpCount > 0 ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-brass/15 text-brass-dark font-medium inline-flex items-center gap-1">
                        <Clock size={11} />
                        #{c.followUpCount} nudge
                      </span>
                    ) : (
                      <span className="text-xs text-ink-faint">Initial</span>
                    )}
                  </td>

                  {/* Next Follow Up Date badge */}
                  <td className="px-4 py-3">
                    <FollowUpBadge date={c.nextFollowUpDate} />
                  </td>

                  {/* Row Action Controls: Quick Bumps + Delete */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Reschedule follow-up +3 days"
                        onClick={(e) => handleQuickBump(c, 3, e)}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-line hover:border-brass hover:bg-brass/10 hover:text-ink transition-colors"
                      >
                        +3d
                      </button>
                      <button
                        type="button"
                        title="Reschedule follow-up +1 week"
                        onClick={(e) => handleQuickBump(c, 7, e)}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-line hover:border-brass hover:bg-brass/10 hover:text-ink transition-colors"
                      >
                        +1w
                      </button>
                      <button
                        type="button"
                        title="Delete contact"
                        onClick={(e) => handleDeleteRow(c, e)}
                        className="p-1 rounded text-ink-faint hover:text-rust hover:bg-rust/10 transition-colors ml-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2.5 text-[11px] font-mono uppercase tracking-wide text-ink-soft font-medium">
      <span className="inline-flex items-center gap-1">{children}</span>
    </th>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <p className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-1">
        Everyone you've reached out to
      </p>
      <h1 className="font-display text-3xl text-ink">Contacts</h1>
    </div>
  );
}
