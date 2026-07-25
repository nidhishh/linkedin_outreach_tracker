import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Rows3 } from "lucide-react";
import { useContacts } from "../lib/ContactsContext";
import { STAGES } from "../lib/stages";
import { lastInteractionDate } from "../lib/storage";
import { formatDate } from "../lib/dateUtils";
import StageBadge from "../components/StageBadge";
import FollowUpBadge from "../components/FollowUpBadge";
import EmptyState from "../components/EmptyState";

const SORTS = {
  recent: { label: "Last activity", fn: (a, b) => (lastInteractionDate(a) || "") < (lastInteractionDate(b) || "") ? 1 : -1 },
  name: { label: "Name (A–Z)", fn: (a, b) => a.name.localeCompare(b.name) },
  followup: { label: "Follow-up date", fn: (a, b) => (a.nextFollowUpDate || "9999") < (b.nextFollowUpDate || "9999") ? -1 : 1 },
};

export default function Contacts() {
  const { contacts } = useContacts();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortKey, setSortKey] = useState("recent");

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

  return (
    <div>
      <Header />

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
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

        <span className="text-xs font-mono text-ink-faint ml-auto">
          {filtered.length} of {contacts.length}
        </span>
      </div>

      <div className="border border-line rounded-card overflow-hidden bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper/40 text-left">
              <Th>Name</Th>
              <Th>Company</Th>
              <Th>Stage</Th>
              <Th>Tags</Th>
              <Th>Last activity</Th>
              <Th>Next follow-up</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/contacts/${c.id}`)}
                className="border-b border-line last:border-b-0 hover:bg-paper/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-display text-[15px] text-ink">{c.name}</p>
                  <p className="text-xs text-ink-soft">{c.title || "—"}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.company || "—"}</td>
                <td className="px-4 py-3">
                  <StageBadge stageId={c.stage} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {(c.tags || []).slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-ink/[0.05] text-ink-soft"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-ink-faint">
                  {formatDate(lastInteractionDate(c))}
                </td>
                <td className="px-4 py-3">
                  <FollowUpBadge date={c.nextFollowUpDate} />
                </td>
              </tr>
            ))}
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
