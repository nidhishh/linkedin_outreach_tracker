import { useRef, useState } from "react";
import { X, Download, Upload, Archive } from "lucide-react";
import * as store from "../lib/storage";
import { useContacts } from "../lib/ContactsContext";

export default function BackupModal({ open, onClose }) {
  const { refresh, contacts } = useContacts();
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null);

  if (!open) return null;

  async function handleExport() {
    const json = await store.exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `rolodex-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await store.importData(text);
      await refresh();
      setStatus({ ok: true, msg: "Backup restored." });
    } catch (err) {
      setStatus({ ok: false, msg: "Couldn't read that file — is it a Rolodex backup?" });
    }
    e.target.value = "";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 backdrop-blur-[2px] px-4 py-10">
      <div className="w-full max-w-md bg-surface rounded-card shadow-cardHover border border-line">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display text-xl text-ink flex items-center gap-2">
            <Archive size={18} strokeWidth={1.75} />
            Backup
          </h2>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <p className="text-sm text-ink-soft leading-relaxed">
            Your {contacts.length} contact{contacts.length === 1 ? "" : "s"} live only
            in this browser. Export a backup now and then to keep them safe, or
            move them to another computer.
          </p>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-surface text-sm font-medium px-4 py-2.5 rounded-sm transition-colors"
          >
            <Download size={15} />
            Download backup (.json)
          </button>

          <div className="border-t border-line pt-4">
            <button
              onClick={handleImportClick}
              className="w-full flex items-center justify-center gap-2 border border-line hover:border-ink/40 text-ink text-sm font-medium px-4 py-2.5 rounded-sm transition-colors"
            >
              <Upload size={15} />
              Restore from backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-[11px] text-ink-faint mt-2 text-center">
              Restoring replaces everything currently in this browser.
            </p>
          </div>

          {status && (
            <p
              className={`text-xs font-medium ${
                status.ok ? "text-sage" : "text-rust"
              }`}
            >
              {status.msg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
