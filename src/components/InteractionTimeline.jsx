import { useState } from "react";
import { Trash2, MessageSquarePlus } from "lucide-react";
import { INTERACTION_TYPES } from "../lib/stages";
import { formatDate, todayStr } from "../lib/dateUtils";
import { useContacts } from "../lib/ContactsContext";

export default function InteractionTimeline({ contact }) {
  const { logInteraction, removeInteraction } = useContacts();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState(INTERACTION_TYPES[1]);
  const [date, setDate] = useState(todayStr());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const interactions = contact.interactions || [];

  async function handleAdd(e) {
    e.preventDefault();
    if (!notes.trim() && !type) return;
    setSaving(true);
    await logInteraction(contact.id, { type, date, notes });
    setSaving(false);
    setNotes("");
    setType(INTERACTION_TYPES[1]);
    setDate(todayStr());
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-ink">Conversation history</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal-dark transition-colors"
          >
            <MessageSquarePlus size={14} />
            Log interaction
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="border border-line rounded-card bg-paper/40 p-4 mb-5 flex flex-col gap-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input"
            >
              {INTERACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What happened? What did you talk about?"
            rows={3}
            autoFocus
            className="input resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-ink-soft hover:text-ink px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-teal hover:bg-teal-dark text-surface text-sm font-medium px-4 py-1.5 rounded-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add entry"}
            </button>
          </div>
        </form>
      )}

      {interactions.length === 0 ? (
        <p className="text-sm text-ink-faint italic">
          No interactions logged yet.
        </p>
      ) : (
        <ol className="relative border-l border-line ml-1.5">
          {interactions.map((entry) => (
            <li key={entry.id} className="mb-5 ml-5 group">
              <span className="absolute -left-[5px] w-[9px] h-[9px] rounded-full bg-teal border-2 border-surface" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wide text-ink-soft">
                    {entry.type} · {formatDate(entry.date)}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-ink mt-1 whitespace-pre-wrap">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeInteraction(contact.id, entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-rust transition-all shrink-0 mt-0.5"
                  aria-label="Delete interaction"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
