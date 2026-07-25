import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Trash2,
  Building2,
  Calendar,
  Tag as TagIcon,
} from "lucide-react";
import { useContacts } from "../lib/ContactsContext";
import { STAGES, STAGE_MAP } from "../lib/stages";
import { formatDate } from "../lib/dateUtils";
import FollowUpBadge from "../components/FollowUpBadge";
import InteractionTimeline from "../components/InteractionTimeline";
import ContactFormModal from "../components/ContactFormModal";

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contacts, editContact, removeContact, loading } = useContacts();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notesDraft, setNotesDraft] = useState(null);

  const contact = contacts.find((c) => c.id === id);

  if (loading) return null;

  if (!contact) {
    return (
      <div className="max-w-2xl">
        <BackLink />
        <p className="text-sm text-ink-soft mt-6">
          This contact doesn't exist — it may have been deleted.
        </p>
      </div>
    );
  }

  const stage = STAGE_MAP[contact.stage];
  const notesValue = notesDraft === null ? contact.notes || "" : notesDraft;

  async function saveNotes() {
    if (notesDraft !== null && notesDraft !== contact.notes) {
      await editContact(contact.id, { notes: notesDraft });
    }
    setNotesDraft(null);
  }

  async function handleDelete() {
    await removeContact(contact.id);
    navigate("/contacts");
  }

  return (
    <div className="max-w-3xl">
      <BackLink />

      <div className="flex items-start justify-between mt-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stage?.dot }}
            />
            <span className="text-xs font-mono uppercase tracking-wide text-ink-soft">
              {stage?.label}
            </span>
          </div>
          <h1 className="font-display text-3xl text-ink">{contact.name}</h1>
          {(contact.title || contact.company) && (
            <p className="text-sm text-ink-soft mt-1.5 flex items-center gap-1.5">
              <Building2 size={13} />
              {[contact.title, contact.company].filter(Boolean).join(" at ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {contact.linkedinUrl && (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal-dark border border-teal/30 hover:border-teal/60 rounded-sm px-3 py-2 transition-colors"
            >
              LinkedIn
              <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink border border-line rounded-sm px-3 py-2 transition-colors"
          >
            <Pencil size={12} />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-7">
          <section>
            <SectionLabel>Stage</SectionLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => editContact(contact.id, { stage: s.id })}
                  className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-colors ${
                    contact.stage === s.id
                      ? "bg-ink text-surface border-ink"
                      : "border-line text-ink-soft hover:border-ink/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionLabel>Notes</SectionLabel>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={saveNotes}
              placeholder="Background, context, anything worth remembering…"
              rows={4}
              className="input resize-none mt-2"
            />
          </section>

          <section>
            <InteractionTimeline contact={contact} />
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <div className="border border-line rounded-card bg-surface p-4 shadow-card">
            <SectionLabel>Follow-up</SectionLabel>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-ink">
                {formatDate(contact.nextFollowUpDate)}
              </span>
              <FollowUpBadge date={contact.nextFollowUpDate} />
            </div>
            <input
              type="date"
              value={contact.nextFollowUpDate || ""}
              onChange={(e) =>
                editContact(contact.id, { nextFollowUpDate: e.target.value || null })
              }
              className="input mt-3"
            />
          </div>

          <div className="border border-line rounded-card bg-surface p-4 shadow-card flex flex-col gap-3">
            <Detail icon={Calendar} label="First contacted">
              {formatDate(contact.dateFirstContacted)}
            </Detail>
            <Detail icon={TagIcon} label="Source">
              {contact.source || "—"}
            </Detail>
          </div>

          {contact.tags?.length > 0 && (
            <div>
              <SectionLabel>Tags</SectionLabel>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {contact.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-ink/[0.05] text-ink-soft"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-rust transition-colors"
              >
                <Trash2 size={12} />
                Delete contact
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-soft">Delete for good?</span>
                <button
                  onClick={handleDelete}
                  className="text-xs font-medium text-rust hover:text-rust-light"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-ink-soft hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <ContactFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        contact={contact}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/contacts"
      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-ink-soft hover:text-ink transition-colors"
    >
      <ArrowLeft size={13} />
      Back to contacts
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <h3 className="text-xs font-mono uppercase tracking-wide text-ink-soft">
      {children}
    </h3>
  );
}

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-ink-soft">
        <Icon size={13} />
        {label}
      </span>
      <span className="text-ink">{children}</span>
    </div>
  );
}
