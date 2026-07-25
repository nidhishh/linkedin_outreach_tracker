import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useContacts } from "../lib/ContactsContext";
import { STAGES } from "../lib/stages";
import ContactCard from "../components/ContactCard";
import EmptyState from "../components/EmptyState";

export default function Pipeline() {
  const { contacts, editContact } = useContacts();
  const [draggingId, setDraggingId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  if (contacts.length === 0) {
    return (
      <div className="max-w-5xl">
        <Header />
        <EmptyState
          icon={LayoutGrid}
          title="No contacts yet"
          description="Add a contact to see them move through your outreach pipeline."
        />
      </div>
    );
  }

  function handleDrop(stageId) {
    if (draggingId) {
      editContact(draggingId, { stage: stageId });
    }
    setDraggingId(null);
    setOverStage(null);
  }

  return (
    <div>
      <Header />
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {STAGES.map((stage) => {
          const stageContacts = contacts.filter((c) => c.stage === stage.id);
          const isOver = overStage === stage.id;
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStage(stage.id);
              }}
              onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
              onDrop={() => handleDrop(stage.id)}
              className={`w-[260px] shrink-0 rounded-card transition-colors ${
                isOver ? "bg-brass/10" : ""
              }`}
            >
              <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: stage.dot }}
                  />
                  <h3 className="text-xs font-mono uppercase tracking-wide text-ink-soft">
                    {stage.label}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-ink-faint">
                  {stageContacts.length}
                </span>
              </div>

              <div
                className={`min-h-[80px] rounded-card ${
                  isOver ? "outline outline-2 outline-dashed outline-brass/40" : ""
                }`}
              >
                {stageContacts.map((c) => (
                  <ContactCard
                    key={c.id}
                    contact={c}
                    draggable
                    onDragStart={() => setDraggingId(c.id)}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))}
                {stageContacts.length === 0 && (
                  <div className="text-[11px] text-ink-faint italic px-1 py-2">
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <p className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-1">
        Drag cards to update stage
      </p>
      <h1 className="font-display text-3xl text-ink">Pipeline</h1>
    </div>
  );
}
