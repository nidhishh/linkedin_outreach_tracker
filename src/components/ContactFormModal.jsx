import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { STAGES, SOURCE_OPTIONS } from "../lib/stages";
import { todayStr } from "../lib/dateUtils";
import { useContacts } from "../lib/ContactsContext";

const emptyForm = {
  name: "",
  linkedinUrl: "",
  company: "",
  title: "",
  tags: "",
  stage: "to_reach_out",
  source: "",
  dateFirstContacted: todayStr(),
  nextFollowUpDate: "",
  notes: "",
};

export default function ContactFormModal({ open, onClose, contact, onSaved }) {
  const { addContact, editContact } = useContacts();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);
  const isEdit = Boolean(contact);

  useEffect(() => {
    if (open) {
      setForm(
        contact
          ? {
              ...emptyForm,
              ...contact,
              tags: (contact.tags || []).join(", "),
              dateFirstContacted: contact.dateFirstContacted || "",
            }
          : emptyForm
      );
      setTimeout(() => nameRef.current?.focus(), 30);
    }
  }, [open, contact]);

  if (!open) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      nameRef.current?.focus();
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      dateFirstContacted: form.dateFirstContacted || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
    };
    let saved;
    if (isEdit) {
      saved = await editContact(contact.id, payload);
    } else {
      saved = await addContact(payload);
    }
    setSaving(false);
    onSaved?.(saved);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 backdrop-blur-[2px] px-4 py-10">
      <div className="w-full max-w-lg bg-surface rounded-card shadow-cardHover border border-line">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display text-xl text-ink">
            {isEdit ? "Edit contact" : "Add contact"}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <Field label="Name" required>
            <input
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Jordan Rivera"
              className="input"
            />
          </Field>

          <Field label="LinkedIn URL">
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => update("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Title">
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Head of Talent"
                className="input"
              />
            </Field>
            <Field label="Company">
              <input
                type="text"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Inc."
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Stage">
              <select
                value={form.stage}
                onChange={(e) => update("stage", e.target.value)}
                className="input"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Source">
              <select
                value={form.source}
                onChange={(e) => update("source", e.target.value)}
                className="input"
              >
                <option value="">—</option>
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="First contacted">
              <input
                type="date"
                value={form.dateFirstContacted || ""}
                onChange={(e) => update("dateFirstContacted", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Next follow-up">
              <input
                type="date"
                value={form.nextFollowUpDate || ""}
                onChange={(e) => update("nextFollowUpDate", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Tags" hint="Comma-separated">
            <input
              type="text"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="recruiter, warm intro"
              className="input"
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Context, background, anything worth remembering..."
              rows={3}
              className="input resize-none"
            />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-ink-soft hover:text-ink px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-ink hover:bg-ink/90 text-surface text-sm font-medium px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-mono uppercase tracking-wide text-ink-soft">
        {label}
        {required && <span className="text-rust ml-0.5">*</span>}
        {hint && <span className="normal-case text-ink-faint ml-2">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
