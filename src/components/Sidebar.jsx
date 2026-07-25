import { NavLink } from "react-router-dom";
import { LayoutGrid, Rows3, Gauge, Plus, Archive } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Gauge, end: true },
  { to: "/pipeline", label: "Pipeline", icon: LayoutGrid },
  { to: "/contacts", label: "Contacts", icon: Rows3 },
];

export default function Sidebar({ onAddContact, onBackup }) {
  return (
    <aside className="w-60 shrink-0 bg-ink text-surface flex flex-col h-screen sticky top-0">
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl italic tracking-tight">
            Rolodex
          </span>
        </div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-surface/45 mt-1">
          Outreach Tracker
        </p>
      </div>

      <nav className="px-3 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                isActive
                  ? "bg-surface/10 text-surface"
                  : "text-surface/60 hover:text-surface hover:bg-surface/5"
              }`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 pb-6 flex flex-col gap-2">
        <button
          onClick={onBackup}
          className="w-full flex items-center justify-center gap-2 text-surface/50 hover:text-surface/80 text-xs px-3 py-2 transition-colors"
        >
          <Archive size={13} strokeWidth={1.75} />
          Backup / restore
        </button>
        <button
          onClick={onAddContact}
          className="w-full flex items-center justify-center gap-2 bg-brass hover:bg-brass-light text-ink font-medium text-sm px-3 py-2.5 rounded-sm transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Add contact
        </button>
      </div>
    </aside>
  );
}
